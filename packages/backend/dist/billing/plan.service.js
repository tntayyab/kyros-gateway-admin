"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PlanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manifest_shared_1 = require("manifest-shared");
const tenant_entity_1 = require("../entities/tenant.entity");
const postgres_sql_1 = require("../common/utils/postgres-sql");
const billing_config_1 = require("./billing.config");
const billing_email_preferences_1 = require("./billing-email-preferences");
const request_quota_window_1 = require("./request-quota-window");
const subscription_status_1 = require("./subscription-status");
const PRICE_CACHE_TTL_MS = 60 * 60 * 1000;
const BILLING_PRICE_UNAVAILABLE = Object.freeze({
    amount: null,
    currency: null,
    interval: null,
});
const COUNT_FAILURE_WARN_WINDOW_MS = 60 * 1000;
const LIMIT_FAILURE_WARN_WINDOW_MS = 60 * 1000;
const MANIFEST_ERROR_ORIGIN_SQL_LIST = manifest_shared_1.MANIFEST_ERROR_ORIGINS.map((origin) => `'${origin}'`).join(', ');
function envLimit(name) {
    const raw = process.env[name];
    if (raw === undefined || raw === '')
        return undefined;
    if (!/^\d+$/.test(raw))
        return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
}
function canonicalTimeZone(timeZone) {
    return new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone;
}
function currentProcessTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
let PlanService = PlanService_1 = class PlanService {
    tenantRepo;
    dataSource;
    logger = new common_1.Logger(PlanService_1.name);
    priceCache = null;
    lastCountFailureWarnAtMs = 0;
    suppressedCountFailureWarns = 0;
    lastLimitFailureWarnAtMs = 0;
    suppressedLimitFailureWarns = 0;
    requestUsageInitializations = new Map();
    constructor(tenantRepo, dataSource) {
        this.tenantRepo = tenantRepo;
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        if (!(0, billing_config_1.isBillingEnabled)())
            return;
        const storageTimeZone = await this.readRequestStorageTimeZone();
        const processTimeZone = currentProcessTimeZone();
        if (canonicalTimeZone(storageTimeZone) !== canonicalTimeZone(processTimeZone)) {
            throw new Error(`Request quota storage timezone mismatch: trigger=${storageTimeZone}, process=${processTimeZone}`);
        }
    }
    async getBillingSnapshot(ctx) {
        if (!(0, billing_config_1.isBillingEnabled)() || (!ctx.tenantId && !ctx.userId)) {
            return {
                plan: 'free',
                limitOverrides: null,
                billingEmailPreferences: null,
                cancelAtPeriodEnd: false,
                periodEnd: null,
            };
        }
        const rows = await this.dataSource.query(`SELECT
          t."limit_overrides" AS "limitOverrides",
          t."billing_email_preferences" AS "billingEmailPreferences",
          s."plan" AS "subscriptionPlan",
          s."cancelAtPeriodEnd" AS "cancelAtPeriodEnd",
          s."periodEnd" AS "periodEnd"
         FROM (SELECT 1) seed
    LEFT JOIN "tenants" t
           ON t."id" = $1
    LEFT JOIN LATERAL (
          SELECT "plan", "cancelAtPeriodEnd", "periodEnd"
            FROM "subscription"
           WHERE "referenceId" = COALESCE(t."owner_user_id", $2)
             AND "status" IN (${subscription_status_1.PAID_SUBSCRIPTION_STATUS_SQL_LIST})
        ORDER BY "periodEnd" DESC NULLS LAST
           LIMIT 1
         ) s
           ON COALESCE(t."owner_user_id", $2) IS NOT NULL`, [ctx.tenantId, ctx.userId]);
        const row = rows[0];
        return {
            plan: row?.subscriptionPlan === 'pro' ? 'pro' : 'free',
            limitOverrides: row?.limitOverrides ?? null,
            billingEmailPreferences: row?.billingEmailPreferences ?? null,
            cancelAtPeriodEnd: row?.cancelAtPeriodEnd ?? false,
            periodEnd: row?.periodEnd ?? null,
        };
    }
    async findTenant(ctx) {
        if (!ctx.tenantId)
            return null;
        return this.tenantRepo.findOne({ where: { id: ctx.tenantId } });
    }
    async getPlan(ctx) {
        return (await this.getBillingSnapshot(ctx)).plan;
    }
    async getPlanStatus(ctx) {
        if (!(0, billing_config_1.isBillingEnabled)())
            return { enabled: false, plan: 'free' };
        return { enabled: true, plan: await this.getPlan(ctx) };
    }
    limitsForSnapshot(snapshot) {
        const defaults = manifest_shared_1.PLAN_LIMITS[snapshot.plan];
        const prefix = `PLAN_LIMIT_${snapshot.plan.toUpperCase()}`;
        const overrides = snapshot.limitOverrides;
        return {
            requestsPerMonth: overrides?.requestsPerMonth ?? envLimit(`${prefix}_REQUESTS`) ?? defaults.requestsPerMonth,
        };
    }
    async getLimits(ctx, opts = {}) {
        if (!(0, billing_config_1.isBillingEnabled)())
            return manifest_shared_1.UNLIMITED_PLAN_LIMITS;
        try {
            return this.limitsForSnapshot(await this.getBillingSnapshot(ctx));
        }
        catch (err) {
            if (!opts.failOpen)
                throw err;
            this.warnLimitFailureThrottled(ctx.tenantId, err);
            return manifest_shared_1.UNLIMITED_PLAN_LIMITS;
        }
    }
    monthStartMsUtc(now) {
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    }
    nextMonthStartUtc(now) {
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    }
    async countRequestsSince(tenantId, monthStartMs) {
        if (!tenantId)
            return 0;
        const windowStartMs = (0, request_quota_window_1.requestQuotaWindowStartMs)(monthStartMs);
        const windowStart = (0, postgres_sql_1.toSqlTimestamp)(new Date(windowStartMs));
        const rows = await this.dataSource.query(`SELECT "request_count" AS n, "baseline_counted"
         FROM "tenant_request_usage"
        WHERE "tenant_id" = $1
          AND "window_start" = $2`, [tenantId, windowStart]);
        if (rows[0]?.baseline_counted)
            return Number(rows[0].n);
        this.scheduleRequestUsageInitialization(tenantId, windowStartMs, windowStart);
        return Number(rows[0]?.n ?? 0);
    }
    scheduleRequestUsageInitialization(tenantId, windowStartMs, windowStart) {
        const initializationKey = `${tenantId}:${windowStart}`;
        if (this.requestUsageInitializations.has(initializationKey))
            return;
        const pending = this.initializeRequestUsage(tenantId, windowStartMs, windowStart)
            .then(() => undefined)
            .catch((err) => {
            this.logger.warn(`Request usage baseline init failed for tenant ${tenantId}: ${err.message}`);
        })
            .finally(() => {
            if (this.requestUsageInitializations.get(initializationKey) === pending) {
                this.requestUsageInitializations.delete(initializationKey);
            }
        });
        this.requestUsageInitializations.set(initializationKey, pending);
    }
    async initializeRequestUsage(tenantId, windowStartMs, windowStart) {
        const cutoverRows = await this.dataSource.query(`SELECT EXTRACT(EPOCH FROM ("completed_at" AT TIME ZONE 'UTC')) * 1000 AS cutover_ms
         FROM "backfill_state"
        WHERE "name" = $1`, [request_quota_window_1.REQUEST_USAGE_CUTOVER_STATE]);
        const cutoverMs = Number(cutoverRows[0]?.cutover_ms);
        if (!Number.isFinite(cutoverMs)) {
            throw new Error(`Missing request usage cutover state: ${request_quota_window_1.REQUEST_USAGE_CUTOVER_STATE}`);
        }
        let baseline = 0;
        if (windowStartMs < cutoverMs) {
            const storageTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const baselineRows = await this.dataSource.query(`WITH cutover AS (
           SELECT ("completed_at" AT TIME ZONE 'UTC') AT TIME ZONE $3::text AS local_timestamp
             FROM "backfill_state"
            WHERE "name" = $4
         )
         SELECT COUNT(*)::bigint AS n
           FROM (
             SELECT r."id"
               FROM "requests" r
              CROSS JOIN cutover c
              WHERE r."tenant_id" = $1
                AND r."timestamp" >= $2
                AND EXISTS (
                  SELECT 1
                    FROM "agent_messages" pa
                   WHERE pa."request_id" = r."id"
                     AND pa."timestamp" < c.local_timestamp
                     AND (
                       pa."error_origin" IS NULL
                       OR pa."error_origin" NOT IN (${MANIFEST_ERROR_ORIGIN_SQL_LIST})
                     )
                )
                AND NOT EXISTS (
                  SELECT 1
                    FROM "agents" a
                   WHERE a."id" = r."agent_id"
                     AND a."is_playground" = true
                )
             UNION ALL
             SELECT m."id"
               FROM "agent_messages" m
              CROSS JOIN cutover c
              WHERE m."tenant_id" = $1
                AND m."request_id" IS NULL
                AND m."timestamp" >= $2
                AND m."timestamp" < c.local_timestamp
                AND COALESCE(m."superseded", false) = false
                AND (
                  m."error_origin" IS NULL
                  OR m."error_origin" NOT IN (${MANIFEST_ERROR_ORIGIN_SQL_LIST})
                )
                AND NOT EXISTS (
                  SELECT 1
                    FROM "agents" a
                   WHERE a."id" = m."agent_id"
                     AND a."is_playground" = true
                )
           ) historical`, [
                tenantId,
                (0, postgres_sql_1.toLocalSqlTimestamp)(new Date(windowStartMs)),
                storageTimeZone,
                request_quota_window_1.REQUEST_USAGE_CUTOVER_STATE,
            ]);
            baseline = Number(baselineRows[0]?.n ?? 0);
        }
        const initializedRows = await this.dataSource.query(`INSERT INTO "tenant_request_usage" (
         "tenant_id",
         "window_start",
         "request_count",
         "baseline_counted"
       )
       VALUES ($1, $2, $3, true)
       ON CONFLICT ("tenant_id", "window_start")
       DO UPDATE SET
         "request_count" = "tenant_request_usage"."request_count" +
           CASE
             WHEN "tenant_request_usage"."baseline_counted" THEN 0
             ELSE EXCLUDED."request_count"
           END,
         "baseline_counted" = true
       RETURNING "request_count" AS n`, [tenantId, windowStart, baseline]);
        return Number(initializedRows[0]?.n ?? baseline);
    }
    async readRequestStorageTimeZone() {
        const rows = await this.dataSource.query(`
      SELECT pg_get_functiondef(
               to_regprocedure('"count_tenant_request_usage"()')
             ) AS "definition"
    `);
        const storageTimeZone = rows[0]?.definition?.match(/(?:OLD|NEW|prior|r)\."timestamp"\s+AT TIME ZONE '([^']+)'/)?.[1];
        if (!storageTimeZone) {
            throw new Error('Could not read request quota timezone from installed trigger');
        }
        return storageTimeZone;
    }
    async countRequestsThisMonth(tenantId) {
        return this.countRequestsSince(tenantId, this.monthStartMsUtc(new Date()));
    }
    warnCountFailureThrottled(tenantId, err) {
        const now = Date.now();
        if (now - this.lastCountFailureWarnAtMs < COUNT_FAILURE_WARN_WINDOW_MS) {
            this.suppressedCountFailureWarns++;
            return;
        }
        const suppressed = this.suppressedCountFailureWarns;
        this.suppressedCountFailureWarns = 0;
        this.lastCountFailureWarnAtMs = now;
        const tail = suppressed > 0
            ? ` (${suppressed} more suppressed in the last ${COUNT_FAILURE_WARN_WINDOW_MS / 1000}s)`
            : '';
        this.logger.warn(`Request-limit usage lookup failed for tenant ${tenantId}; allowing request: ${err.message}${tail}`);
    }
    warnLimitFailureThrottled(tenantId, err) {
        const now = Date.now();
        if (now - this.lastLimitFailureWarnAtMs < LIMIT_FAILURE_WARN_WINDOW_MS) {
            this.suppressedLimitFailureWarns++;
            return;
        }
        const suppressed = this.suppressedLimitFailureWarns;
        this.suppressedLimitFailureWarns = 0;
        this.lastLimitFailureWarnAtMs = now;
        const tail = suppressed > 0
            ? ` (${suppressed} more suppressed in the last ${LIMIT_FAILURE_WARN_WINDOW_MS / 1000}s)`
            : '';
        this.logger.warn(`Request-limit lookup failed for tenant ${tenantId}; allowing request: ${err.message}${tail}`);
    }
    async assertWithinRequestLimit(ctx) {
        if (!(0, billing_config_1.isBillingEnabled)())
            return;
        const limits = await this.getLimits(ctx, { failOpen: true });
        if (limits.requestsPerMonth === null)
            return;
        let used;
        try {
            used = await this.countRequestsThisMonth(ctx.tenantId);
        }
        catch (err) {
            this.warnCountFailureThrottled(ctx.tenantId, err);
            return;
        }
        if (used < limits.requestsPerMonth)
            return;
        throw new common_1.HttpException({
            statusCode: common_1.HttpStatus.PAYMENT_REQUIRED,
            code: 'PLAN_LIMIT_REQUESTS',
            limit: limits.requestsPerMonth,
            used,
        }, common_1.HttpStatus.PAYMENT_REQUIRED);
    }
    async getBillingStatus(ctx) {
        const billingEnabled = (0, billing_config_1.isBillingEnabled)();
        if (!billingEnabled) {
            return {
                enabled: false,
                plan: 'free',
                priceMonthly: BILLING_PRICE_UNAVAILABLE,
                emailPreferences: billing_email_preferences_1.DEFAULT_BILLING_EMAIL_PREFERENCES,
                requests: { used: null, limit: null, periodEnd: null },
                cancelAtPeriodEnd: false,
                subscriptionPeriodEnd: null,
            };
        }
        const snapshot = await this.getBillingSnapshot(ctx);
        const limits = this.limitsForSnapshot(snapshot);
        const emailPreferences = (0, billing_email_preferences_1.normalizeBillingEmailPreferences)(snapshot.billingEmailPreferences);
        const now = new Date();
        const [requestsUsed, priceMonthly] = await Promise.all([
            this.countRequestsSince(ctx.tenantId, this.monthStartMsUtc(now)),
            this.getProPrice(),
        ]);
        return {
            enabled: true,
            plan: snapshot.plan,
            priceMonthly,
            emailPreferences,
            requests: {
                used: requestsUsed,
                limit: limits.requestsPerMonth,
                periodEnd: this.nextMonthStartUtc(now).toISOString(),
            },
            cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
            subscriptionPeriodEnd: snapshot.periodEnd,
        };
    }
    async getBillingEmailPreferences(ctx) {
        if (!ctx.tenantId)
            return billing_email_preferences_1.DEFAULT_BILLING_EMAIL_PREFERENCES;
        const tenant = await this.findTenant(ctx);
        return (0, billing_email_preferences_1.normalizeBillingEmailPreferences)(tenant?.billing_email_preferences);
    }
    async updateBillingEmailPreferences(ctx, preferences) {
        if (!ctx.tenantId) {
            throw new common_1.BadRequestException('A workspace is required to update billing email preferences.');
        }
        const normalized = (0, billing_email_preferences_1.normalizeBillingEmailPreferences)(preferences);
        await this.tenantRepo.update({ id: ctx.tenantId }, { billing_email_preferences: normalized });
        return normalized;
    }
    async getProPrice() {
        if (this.priceCache && Date.now() - this.priceCache.fetchedAt < PRICE_CACHE_TTL_MS) {
            return this.priceCache.value;
        }
        try {
            const price = await (0, billing_config_1.getStripeClient)().prices.retrieve(process.env['STRIPE_PRO_PRICE_ID']);
            const value = this.stripePriceToBillingPrice(price);
            this.priceCache = { value, fetchedAt: Date.now() };
            return value;
        }
        catch {
            this.priceCache = { value: BILLING_PRICE_UNAVAILABLE, fetchedAt: Date.now() };
            return BILLING_PRICE_UNAVAILABLE;
        }
    }
    stripePriceToBillingPrice(price) {
        const rawAmount = price.unit_amount_decimal ?? (price.unit_amount != null ? String(price.unit_amount) : null);
        const minorAmount = rawAmount != null ? Number(rawAmount) : null;
        return {
            amount: minorAmount != null && Number.isFinite(minorAmount)
                ? minorAmount / this.currencyMinorUnitDivisor(price.currency)
                : null,
            currency: price.currency ? price.currency.toUpperCase() : null,
            interval: price.recurring?.interval ?? null,
        };
    }
    currencyMinorUnitDivisor(currency) {
        try {
            const digits = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
            }).resolvedOptions().maximumFractionDigits ?? 2;
            return 10 ** digits;
        }
        catch {
            return 100;
        }
    }
};
exports.PlanService = PlanService;
exports.PlanService = PlanService = PlanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], PlanService);
//# sourceMappingURL=plan.service.js.map