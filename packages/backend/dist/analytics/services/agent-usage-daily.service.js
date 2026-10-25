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
var AgentUsageDailyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentUsageDailyService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const agent_usage_daily_flags_1 = require("../../common/utils/agent-usage-daily-flags");
const AGENT_USAGE_ROLLUP_LOCK_KEY = 1_802_700_000;
const DEFAULT_BATCH_SIZE = 250;
const DEFAULT_RUN_BUDGET_MS = 5_000;
const READ_BACKFILL_DAYS = 730;
const READ_LAG_GRACE_MINUTES = 2;
function positiveInteger(value, fallback) {
    if (!value || !/^\d+$/.test(value))
        return fallback;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function utcDateDaysAgo(days) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
}
const DAILY_RANGE_DAYS = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '365d': 365,
};
let AgentUsageDailyService = AgentUsageDailyService_1 = class AgentUsageDailyService {
    dataSource;
    logger = new common_1.Logger(AgentUsageDailyService_1.name);
    running = false;
    automaticReadsConfirmed = false;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        if (process.env['AGENT_USAGE_DAILY_WORKER'] === 'false') {
            (0, agent_usage_daily_flags_1.setAgentUsageDailyAutomaticReadsReady)(false);
            return;
        }
        await this.refreshAutomaticReads();
    }
    readsEnabledFor(tenantId) {
        return (0, agent_usage_daily_flags_1.agentUsageDailyReadsEnabled)(tenantId);
    }
    async refreshAutomaticReads() {
        if (this.automaticReadsConfirmed)
            return;
        try {
            const rows = (await this.dataSource.query(`WITH pending_request AS (
           SELECT r."id"
           FROM "requests" r
           WHERE r."agent_usage_rolled_up_at" IS NULL
             AND (r."status" IS NULL OR r."status" NOT IN ('pending', 'cancelled'))
             AND r."tenant_id" IS NOT NULL
             AND r."agent_id" IS NOT NULL
             AND r."timestamp" >= $1::timestamp
             AND r."timestamp" < $2::timestamp
             AND EXISTS (SELECT 1 FROM "agents" a WHERE a."id" = r."agent_id")
           ORDER BY r."timestamp" ASC, r."id" ASC
           LIMIT 1
         ), pending_attempt AS (
           SELECT pa."id"
           FROM "agent_messages" pa
           WHERE pa."agent_usage_rolled_up_at" IS NULL
             AND (pa."status" IS NULL OR pa."status" NOT IN ('pending', 'cancelled'))
             AND pa."tenant_id" IS NOT NULL
             AND pa."agent_id" IS NOT NULL
             AND pa."timestamp" >= $1::timestamp
             AND pa."timestamp" < $2::timestamp
             AND EXISTS (SELECT 1 FROM "agents" a WHERE a."id" = pa."agent_id")
           ORDER BY pa."timestamp" ASC, pa."id" ASC
           LIMIT 1
         )
         SELECT to_regclass('agent_usage_daily') IS NOT NULL
           AND NOT EXISTS (
           SELECT 1 FROM pending_request
           UNION ALL
           SELECT 1 FROM pending_attempt
         ) AS "ready"`, [
                (0, postgres_sql_1.computeCutoff)(`${READ_BACKFILL_DAYS} days`),
                (0, postgres_sql_1.toLocalSqlTimestamp)(new Date(Date.now() - READ_LAG_GRACE_MINUTES * 60_000)),
            ]));
            this.automaticReadsConfirmed = rows[0]?.ready === true;
            (0, agent_usage_daily_flags_1.setAgentUsageDailyAutomaticReadsReady)(this.automaticReadsConfirmed);
        }
        catch (error) {
            (0, agent_usage_daily_flags_1.setAgentUsageDailyAutomaticReadsReady)(false);
            this.logger.warn(`agent usage rollup readiness check failed: ${String(error)}`);
        }
    }
    supportsRange(tenantId, range) {
        return this.readsEnabledFor(tenantId) && DAILY_RANGE_DAYS[range] !== undefined;
    }
    async getRows(tenantId) {
        return (await this.dataSource.query(`SELECT
         "agent_id",
         "day"::text AS "day",
         "request_count"::text AS "request_count",
         "input_tokens"::text AS "input_tokens",
         "output_tokens"::text AS "output_tokens",
         "cost_usd"::text AS "cost_usd",
         "last_active_at"
       FROM "agent_usage_daily"
       WHERE "tenant_id" = $1
         AND "day" >= $2::date
       ORDER BY "agent_id" ASC, "day" ASC`, [tenantId, utcDateDaysAgo(29)]));
    }
    async getRangeRows(tenantId, range, options = {}) {
        const days = DAILY_RANGE_DAYS[range];
        if (days === undefined)
            return [];
        const startDay = utcDateDaysAgo((options.previous ? days * 2 : days) - 1);
        const endDay = options.previous ? utcDateDaysAgo(days - 1) : null;
        const rows = (await this.dataSource.query(`SELECT
         u."agent_id",
         a."name" AS "agent_name",
         u."day"::text AS "day",
         u."request_count"::text AS "request_count",
         u."successful_request_count"::text AS "successful_request_count",
         u."failed_request_count"::text AS "failed_request_count",
         u."input_tokens"::text AS "input_tokens",
         u."output_tokens"::text AS "output_tokens",
         u."cost_usd"::text AS "cost_usd",
         u."last_active_at"
       FROM "agent_usage_daily" u
       JOIN "agents" a ON a."id" = u."agent_id"
       WHERE u."tenant_id" = $1
         AND u."day" >= $2::date
         AND ($3::date IS NULL OR u."day" < $3::date)
         AND a."is_playground" = false
         ${options.agentScope ? 'AND u."agent_id" = $4' : ''}
       ORDER BY u."day" ASC, a."name" ASC`, [tenantId, startDay, endDay, ...(options.agentScope ? [options.agentScope.agentId] : [])]));
        if (!options.excludeDirect || !options.agentScope || rows.length === 0)
            return rows;
        const storageTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const directRows = (await this.dataSource.query(`WITH direct_attempts AS (
         SELECT
           (((pa."timestamp" AT TIME ZONE $5) AT TIME ZONE 'UTC')::date) AS "day",
           COUNT(*) FILTER (WHERE pa."request_id" IS NULL)::bigint AS "request_count",
           COUNT(*) FILTER (
             WHERE pa."request_id" IS NULL
               AND (pa."status" IS NULL OR pa."status" IN ('ok', 'success'))
           )::bigint AS "successful_request_count",
           COUNT(*) FILTER (
             WHERE pa."request_id" IS NULL
               AND pa."status" IS NOT NULL
               AND pa."status" NOT IN ('ok', 'success')
           )::bigint AS "failed_request_count",
           COALESCE(SUM(pa."input_tokens"), 0)::bigint AS "input_tokens",
           COALESCE(SUM(pa."output_tokens"), 0)::bigint AS "output_tokens",
           COALESCE(SUM(CASE WHEN pa."cost_usd" >= 0 THEN pa."cost_usd" ELSE 0 END), 0)::numeric AS "cost_usd"
         FROM "agent_messages" pa
         WHERE pa."tenant_id" = $1
           AND pa."agent_id" = $4
           AND pa."routing_reason" = 'direct'
           AND pa."agent_usage_rolled_up_at" IS NOT NULL
           AND pa."timestamp" >= (($2::date::timestamp AT TIME ZONE 'UTC') AT TIME ZONE $5)
           AND (
             $3::date IS NULL
             OR pa."timestamp" < (($3::date::timestamp AT TIME ZONE 'UTC') AT TIME ZONE $5)
           )
         GROUP BY "day"
       ), direct_requests AS (
         SELECT
           (((r."timestamp" AT TIME ZONE $5) AT TIME ZONE 'UTC')::date) AS "day",
           COUNT(*)::bigint AS "request_count",
           COUNT(*) FILTER (WHERE r."status" IS NULL OR r."status" IN ('ok', 'success'))::bigint AS "successful_request_count",
           COUNT(*) FILTER (
             WHERE r."status" IS NOT NULL AND r."status" NOT IN ('ok', 'success')
           )::bigint AS "failed_request_count"
         FROM "requests" r
         WHERE r."tenant_id" = $1
           AND r."agent_id" = $4
           AND r."agent_usage_rolled_up_at" IS NOT NULL
           AND r."timestamp" >= (($2::date::timestamp AT TIME ZONE 'UTC') AT TIME ZONE $5)
           AND (
             $3::date IS NULL
             OR r."timestamp" < (($3::date::timestamp AT TIME ZONE 'UTC') AT TIME ZONE $5)
           )
           AND EXISTS (
             SELECT 1
             FROM "agent_messages" pa
             WHERE pa."request_id" = r."id"
               AND pa."tenant_id" = $1
               AND pa."agent_id" = $4
               AND pa."routing_reason" = 'direct'
           )
         GROUP BY "day"
       )
       SELECT
         "day"::text AS "day",
         SUM("request_count")::text AS "request_count",
         SUM("successful_request_count")::text AS "successful_request_count",
         SUM("failed_request_count")::text AS "failed_request_count",
         SUM("input_tokens")::text AS "input_tokens",
         SUM("output_tokens")::text AS "output_tokens",
         SUM("cost_usd")::text AS "cost_usd"
       FROM (
         SELECT * FROM direct_attempts
         UNION ALL
         SELECT
           "day", "request_count", "successful_request_count", "failed_request_count",
           0::bigint, 0::bigint, 0::numeric
         FROM direct_requests
       ) direct_usage
       GROUP BY "day"`, [tenantId, startDay, endDay, options.agentScope.agentId, storageTimeZone]));
        const directByDay = new Map(directRows.map((row) => [row.day, row]));
        return rows.map((row) => {
            const direct = directByDay.get(row.day);
            if (!direct)
                return row;
            return {
                ...row,
                request_count: String(Math.max(0, Number(row.request_count) - Number(direct.request_count))),
                successful_request_count: String(Math.max(0, Number(row.successful_request_count ?? 0) -
                    Number(direct.successful_request_count ?? 0))),
                failed_request_count: String(Math.max(0, Number(row.failed_request_count ?? 0) - Number(direct.failed_request_count ?? 0))),
                input_tokens: String(Math.max(0, Number(row.input_tokens) - Number(direct.input_tokens))),
                output_tokens: String(Math.max(0, Number(row.output_tokens) - Number(direct.output_tokens))),
                cost_usd: String(Math.max(0, Number(row.cost_usd) - Number(direct.cost_usd))),
            };
        });
    }
    async runScheduled() {
        if (process.env['AGENT_USAGE_DAILY_WORKER'] === 'false') {
            (0, agent_usage_daily_flags_1.setAgentUsageDailyAutomaticReadsReady)(false);
            return;
        }
        if (this.running)
            return;
        this.running = true;
        const startedAt = Date.now();
        let processed = 0;
        let rollups = 0;
        try {
            const batchSize = positiveInteger(process.env['AGENT_USAGE_DAILY_BATCH_SIZE'], DEFAULT_BATCH_SIZE);
            const budgetMs = positiveInteger(process.env['AGENT_USAGE_DAILY_RUN_BUDGET_MS'], DEFAULT_RUN_BUDGET_MS);
            do {
                const result = await this.processBatch(batchSize);
                if (!result.acquired)
                    break;
                processed += result.processed;
                rollups += result.rollups;
                if (result.processed < batchSize)
                    break;
            } while (Date.now() - startedAt < budgetMs);
            if (processed > 0) {
                this.logger.log(`agent usage rollup: processed ${processed} request(s), wrote ${rollups} daily row(s) in ${Date.now() - startedAt}ms`);
            }
        }
        catch (error) {
            this.logger.error(`agent usage rollup failed after ${processed} request(s): ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            await this.refreshAutomaticReads();
            this.running = false;
        }
    }
    async processBatch(batchSize = DEFAULT_BATCH_SIZE) {
        const storageTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        return this.dataSource.transaction(async (manager) => {
            await manager.query(`SET LOCAL lock_timeout = '250ms'`);
            await manager.query(`SET LOCAL statement_timeout = '5s'`);
            const lockRows = (await manager.query(`SELECT pg_try_advisory_xact_lock($1::bigint) AS acquired`, [AGENT_USAGE_ROLLUP_LOCK_KEY]));
            if (lockRows[0]?.acquired !== true) {
                return { acquired: false, processed: 0, rollups: 0 };
            }
            const rows = (await manager.query(`WITH selected AS MATERIALIZED (
           SELECT r."id", r."tenant_id", r."agent_id", r."timestamp", r."status"
           FROM "requests" r
           WHERE r."agent_usage_rolled_up_at" IS NULL
             AND (r."status" IS NULL OR r."status" NOT IN ('pending', 'cancelled'))
             AND r."tenant_id" IS NOT NULL
             AND r."agent_id" IS NOT NULL
           ORDER BY r."timestamp" DESC, r."id" DESC
           LIMIT $1
           FOR UPDATE SKIP LOCKED
         ), selected_attempts AS MATERIALIZED (
           SELECT
             pa."id", pa."request_id", pa."tenant_id", pa."agent_id", pa."timestamp",
             pa."status", pa."input_tokens", pa."output_tokens", pa."cost_usd"
           FROM "agent_messages" pa
           WHERE pa."agent_usage_rolled_up_at" IS NULL
             AND (pa."status" IS NULL OR pa."status" NOT IN ('pending', 'cancelled'))
             AND pa."tenant_id" IS NOT NULL
             AND pa."agent_id" IS NOT NULL
           ORDER BY pa."timestamp" DESC, pa."id" DESC
           LIMIT $1
           FOR UPDATE SKIP LOCKED
         ), request_rollups AS (
           SELECT
             s."tenant_id",
             s."agent_id",
             (((s."timestamp" AT TIME ZONE $2) AT TIME ZONE 'UTC')::date) AS "day",
             COUNT(*)::bigint AS "request_count",
             COUNT(*) FILTER (WHERE s."status" IS NULL OR s."status" IN ('ok', 'success'))::bigint AS "successful_request_count",
             COUNT(*) FILTER (WHERE s."status" IS NOT NULL AND s."status" NOT IN ('ok', 'success'))::bigint AS "failed_request_count",
             0::bigint AS "input_tokens",
             0::bigint AS "output_tokens",
             0::numeric AS "cost_usd",
             MAX(s."timestamp") AS "last_active_at"
           FROM selected s
           WHERE EXISTS (SELECT 1 FROM "agents" a WHERE a."id" = s."agent_id")
           GROUP BY s."tenant_id", s."agent_id", "day"
         ), attempt_rollups AS (
           SELECT
             pa."tenant_id",
             pa."agent_id",
             (((pa."timestamp" AT TIME ZONE $2) AT TIME ZONE 'UTC')::date) AS "day",
             COUNT(*) FILTER (WHERE pa."request_id" IS NULL)::bigint AS "request_count",
             COUNT(*) FILTER (
               WHERE pa."request_id" IS NULL
                 AND (pa."status" IS NULL OR pa."status" IN ('ok', 'success'))
             )::bigint AS "successful_request_count",
             COUNT(*) FILTER (
               WHERE pa."request_id" IS NULL
                 AND pa."status" IS NOT NULL
                 AND pa."status" NOT IN ('ok', 'success')
             )::bigint AS "failed_request_count",
             COALESCE(SUM(pa."input_tokens"), 0)::bigint AS "input_tokens",
             COALESCE(SUM(pa."output_tokens"), 0)::bigint AS "output_tokens",
             COALESCE(SUM(CASE WHEN pa."cost_usd" >= 0 THEN pa."cost_usd" ELSE 0 END), 0)::numeric AS "cost_usd",
             MAX(pa."timestamp") AS "last_active_at"
           FROM selected_attempts pa
           WHERE EXISTS (SELECT 1 FROM "agents" a WHERE a."id" = pa."agent_id")
           GROUP BY pa."tenant_id", pa."agent_id", "day"
         ), increments AS (
           SELECT
             "tenant_id",
             "agent_id",
             "day",
             SUM("request_count")::bigint AS "request_count",
             SUM("successful_request_count")::bigint AS "successful_request_count",
             SUM("failed_request_count")::bigint AS "failed_request_count",
             SUM("input_tokens")::bigint AS "input_tokens",
             SUM("output_tokens")::bigint AS "output_tokens",
             SUM("cost_usd")::numeric AS "cost_usd",
             MAX("last_active_at") AS "last_active_at"
           FROM (
             SELECT * FROM request_rollups
             UNION ALL
             SELECT * FROM attempt_rollups
           ) combined
           GROUP BY "tenant_id", "agent_id", "day"
         ), upserted AS (
           INSERT INTO "agent_usage_daily" (
             "tenant_id", "agent_id", "day", "request_count",
             "successful_request_count", "failed_request_count", "input_tokens",
             "output_tokens", "cost_usd", "last_active_at", "updated_at"
           )
           SELECT
             "tenant_id", "agent_id", "day", "request_count",
             "successful_request_count", "failed_request_count", "input_tokens",
             "output_tokens", "cost_usd", "last_active_at", NOW()
           FROM increments
           ON CONFLICT ("tenant_id", "agent_id", "day") DO UPDATE SET
             "request_count" = "agent_usage_daily"."request_count" + EXCLUDED."request_count",
             "successful_request_count" = "agent_usage_daily"."successful_request_count" + EXCLUDED."successful_request_count",
             "failed_request_count" = "agent_usage_daily"."failed_request_count" + EXCLUDED."failed_request_count",
             "input_tokens" = "agent_usage_daily"."input_tokens" + EXCLUDED."input_tokens",
             "output_tokens" = "agent_usage_daily"."output_tokens" + EXCLUDED."output_tokens",
             "cost_usd" = "agent_usage_daily"."cost_usd" + EXCLUDED."cost_usd",
             "last_active_at" = GREATEST("agent_usage_daily"."last_active_at", EXCLUDED."last_active_at"),
             "updated_at" = NOW()
           RETURNING 1
         ), marked_requests AS (
           UPDATE "requests" r
           SET "agent_usage_rolled_up_at" = NOW()
           FROM selected s, (SELECT COUNT(*) FROM upserted) ready
           WHERE r."id" = s."id"
           RETURNING 1
         ), marked_attempts AS (
           UPDATE "agent_messages" pa
           SET "agent_usage_rolled_up_at" = NOW()
           FROM selected_attempts s, (SELECT COUNT(*) FROM upserted) ready
           WHERE pa."id" = s."id"
           RETURNING 1
         )
         SELECT
           (
             (SELECT COUNT(*)::int FROM marked_requests) +
             (SELECT COUNT(*)::int FROM marked_attempts)
           ) AS processed,
           (SELECT COUNT(*)::int FROM upserted) AS rollups`, [Math.max(1, Math.floor(batchSize)), storageTimeZone]));
            return {
                acquired: true,
                processed: Number(rows[0]?.processed ?? 0),
                rollups: Number(rows[0]?.rollups ?? 0),
            };
        });
    }
};
exports.AgentUsageDailyService = AgentUsageDailyService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentUsageDailyService.prototype, "runScheduled", null);
exports.AgentUsageDailyService = AgentUsageDailyService = AgentUsageDailyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AgentUsageDailyService);
//# sourceMappingURL=agent-usage-daily.service.js.map