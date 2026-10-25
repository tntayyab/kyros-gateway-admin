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
var BillingUsageEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingUsageEmailService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ingest_event_bus_service_1 = require("../common/services/ingest-event-bus.service");
const billing_config_1 = require("./billing.config");
const plan_service_1 = require("./plan.service");
const billing_email_log_service_1 = require("./billing-email-log.service");
const billing_email_service_1 = require("./billing-email.service");
const billing_email_preferences_1 = require("./billing-email-preferences");
const REQUEST_WARNING_RATIO = 0.8;
let BillingUsageEmailService = BillingUsageEmailService_1 = class BillingUsageEmailService {
    ingestBus;
    planService;
    dataSource;
    logs;
    emails;
    logger = new common_1.Logger(BillingUsageEmailService_1.name);
    ingestSub;
    constructor(ingestBus, planService, dataSource, logs, emails) {
        this.ingestBus = ingestBus;
        this.planService = planService;
        this.dataSource = dataSource;
        this.logs = logs;
        this.emails = emails;
    }
    onModuleInit() {
        this.ingestSub = this.ingestBus.all().subscribe((event) => {
            if (event.kind !== 'message')
                return;
            void this.checkTenantUsage(event.tenantId).catch((err) => {
                this.logger.warn(`Billing usage email check failed for tenant ${event.tenantId}: ${err}`);
            });
        });
    }
    onModuleDestroy() {
        this.ingestSub?.unsubscribe();
    }
    async checkTenantUsage(tenantId) {
        if (!(0, billing_config_1.isBillingEnabled)())
            return false;
        const limits = await this.planService.getLimits({ tenantId, userId: null });
        const limit = limits.requestsPerMonth;
        if (limit === null || limit <= 0)
            return false;
        const now = new Date();
        const monthStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
        const periodStart = new Date(monthStartMs).toISOString();
        const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
        const used = await this.planService.countRequestsSince(tenantId, monthStartMs);
        const kind = this.resolveMilestoneKind(used, limit);
        if (!kind)
            return false;
        const dedupeKey = `billing-usage:${tenantId}:${periodStart}:${kind}`;
        if (await this.logs.hasDedupeKey(dedupeKey))
            return false;
        const recipient = await this.resolveRecipient(tenantId);
        if (!recipient?.email) {
            this.logger.warn(`No billing email recipient found for tenant ${tenantId}`);
            return false;
        }
        if (!(0, billing_email_preferences_1.normalizeBillingEmailPreferences)(recipient.billing_email_preferences).usageAlerts) {
            return false;
        }
        const sent = await this.emails.sendPlanUsageEmail(recipient.email, {
            kind,
            userName: recipient.name,
            used,
            limit,
            periodEnd,
        });
        if (!sent)
            return false;
        await this.logs.tryInsert({
            dedupeKey,
            kind,
            tenantId,
            userId: recipient.user_id,
            periodStart,
            periodEnd,
            metadata: { used, limit },
        });
        return true;
    }
    resolveMilestoneKind(used, limit) {
        if (used >= limit)
            return 'requests_limit_reached';
        if (used >= Math.ceil(limit * REQUEST_WARNING_RATIO))
            return 'requests_warning';
        return null;
    }
    async resolveRecipient(tenantId) {
        const rows = await this.dataSource.query(`SELECT COALESCE(u.email, t.email) AS email,
              COALESCE(NULLIF(u.name, ''), NULLIF(t.organization_name, '')) AS name,
              t.owner_user_id AS user_id,
              t.billing_email_preferences AS billing_email_preferences
         FROM tenants t
         LEFT JOIN "user" u ON u.id = t.owner_user_id
        WHERE t.id = $1`, [tenantId]);
        return rows[0] ?? null;
    }
};
exports.BillingUsageEmailService = BillingUsageEmailService;
exports.BillingUsageEmailService = BillingUsageEmailService = BillingUsageEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ingest_event_bus_service_1.IngestEventBusService,
        plan_service_1.PlanService,
        typeorm_1.DataSource,
        billing_email_log_service_1.BillingEmailLogService,
        billing_email_service_1.BillingEmailService])
], BillingUsageEmailService);
//# sourceMappingURL=billing-usage-email.service.js.map