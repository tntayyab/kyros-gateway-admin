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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptStatsService = exports.ATTEMPT_METRIC_KEYS = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const range_util_1 = require("../../common/utils/range.util");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const query_helpers_1 = require("./query-helpers");
exports.ATTEMPT_METRIC_KEYS = ['total_attempts', 'fallbacked_attempts'];
let AttemptStatsService = class AttemptStatsService {
    attemptRepo;
    constructor(attemptRepo) {
        this.attemptRepo = attemptRepo;
    }
    async getStats(params) {
        const range = params.range ?? '7d';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const previousCutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToPreviousInterval)(range));
        const [current, previous] = await Promise.all([
            this.queryWindow(cutoff, undefined, params.tenantId, params.agentScope),
            this.queryWindow(previousCutoff, cutoff, params.tenantId, params.agentScope),
        ]);
        return {
            total_attempts: { value: current.attempts, previous: previous.attempts },
            fallbacked_attempts: {
                value: current.fallbacked_attempts,
                previous: previous.fallbacked_attempts,
            },
        };
    }
    async getTimeseries(params) {
        const range = params.range ?? '7d';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const bucketExpression = (0, range_util_1.isHourlyRange)(range)
            ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp')
            : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const qb = this.attemptRepo
            .createQueryBuilder('at')
            .select(bucketExpression, 'bucket')
            .addSelect('COUNT(*)', 'attempts')
            .addSelect('COUNT(*) FILTER (WHERE at.fallback_from_model IS NOT NULL)', 'fallbacked_attempts')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId, params.agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const rows = (await qb.groupBy('bucket').orderBy('bucket', 'ASC').getRawMany());
        return {
            range,
            by: 'metric',
            keys: [...exports.ATTEMPT_METRIC_KEYS],
            buckets: rows.map((row) => ({
                bucket: String(row['bucket']),
                counts: [Number(row['attempts'] ?? 0), Number(row['fallbacked_attempts'] ?? 0)],
            })),
        };
    }
    scopeToConnectionWithLegacyFold(qb, params) {
        if (params.provider) {
            qb.andWhere('at.provider = :provider', { provider: params.provider });
        }
        if (params.authType) {
            if (params.authType === 'api_key') {
                qb.andWhere('(at.auth_type = :authType OR at.auth_type IS NULL)', {
                    authType: params.authType,
                });
            }
            else {
                qb.andWhere('at.auth_type = :authType', { authType: params.authType });
            }
        }
        if (params.tenantProviderId) {
            const labelFold = params.label
                ? "LOWER(COALESCE(at.provider_key_label, 'Default')) = LOWER(:connLabel)"
                : "COALESCE(at.provider_key_label, 'Default') = 'Default'";
            qb.andWhere(`(at.tenant_provider_id = :tenantProviderId OR (at.tenant_provider_id IS NULL AND ${labelFold}))`, {
                tenantProviderId: params.tenantProviderId,
                ...(params.label ? { connLabel: params.label } : {}),
            });
        }
        else {
            (0, query_helpers_1.scopeToConnection)(qb, undefined, params.label);
        }
    }
    async getConnectionStatusTimeseries(params) {
        const range = params.range ?? '7d';
        if (!params.tenantId)
            return { range, by: 'metric', keys: [], buckets: [] };
        const bucketExpression = (0, range_util_1.isHourlyRange)(range)
            ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp')
            : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const qb = this.attemptRepo
            .createQueryBuilder('at')
            .select(bucketExpression, 'bucket')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')})`, 'success')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsFailedStatus)('at.status')})`, 'error')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        this.scopeToConnectionWithLegacyFold(qb, params);
        const rows = (await qb.groupBy('bucket').orderBy('bucket', 'ASC').getRawMany());
        return {
            range,
            by: 'metric',
            keys: ['success', 'error'],
            buckets: rows.map((row) => ({
                bucket: String(row['bucket']),
                counts: [Number(row['success'] ?? 0), Number(row['error'] ?? 0)],
            })),
        };
    }
    async getConnectionAttemptsByAgentTimeseries(params) {
        const range = params.range ?? '7d';
        if (!params.tenantId)
            return { agents: [], timeseries: [] };
        const hourly = (0, range_util_1.isHourlyRange)(range);
        const bucketExpression = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const qb = this.attemptRepo
            .createQueryBuilder('at')
            .select(bucketExpression, 'bucket')
            .addSelect("COALESCE(at.agent_name, 'Unknown')", 'agent_name')
            .addSelect('COUNT(*)', 'attempts')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        this.scopeToConnectionWithLegacyFold(qb, params);
        const rows = (await qb
            .groupBy('bucket')
            .addGroupBy("COALESCE(at.agent_name, 'Unknown')")
            .orderBy('bucket', 'ASC')
            .getRawMany());
        const agents = new Set();
        const byBucket = new Map();
        for (const row of rows) {
            const bucket = String(row['bucket']);
            const agent = String(row['agent_name']);
            agents.add(agent);
            let entry = byBucket.get(bucket);
            if (!entry) {
                entry = { [bucketAlias]: bucket };
                byBucket.set(bucket, entry);
            }
            entry[agent] = Number(row['attempts'] ?? 0);
        }
        return { agents: [...agents].sort(), timeseries: [...byBucket.values()] };
    }
    async getConnectionHttpStatusTimeseries(params) {
        const range = params.range ?? '7d';
        if (!params.tenantId)
            return { range, by: 'metric', keys: [], buckets: [] };
        const bucketExpression = (0, range_util_1.isHourlyRange)(range)
            ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp')
            : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const codeExpr = `CASE
      WHEN ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')} THEN '200'
      ELSE COALESCE(at.error_http_status::text, 'No response') END`;
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const qb = this.attemptRepo
            .createQueryBuilder('at')
            .select(bucketExpression, 'bucket')
            .addSelect(codeExpr, 'code')
            .addSelect('COUNT(*)', 'attempts')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        this.scopeToConnectionWithLegacyFold(qb, params);
        const rows = (await qb
            .groupBy('bucket')
            .addGroupBy(codeExpr)
            .orderBy('bucket', 'ASC')
            .getRawMany());
        const keys = [...new Set(rows.map((r) => String(r['code'])))].sort((a, b) => {
            if (a === '200')
                return -1;
            if (b === '200')
                return 1;
            if (a === 'No response')
                return 1;
            if (b === 'No response')
                return -1;
            return Number(a) - Number(b);
        });
        const byBucket = new Map();
        for (const row of rows) {
            const bucket = String(row['bucket']);
            let counts = byBucket.get(bucket);
            if (!counts) {
                counts = new Array(keys.length).fill(0);
                byBucket.set(bucket, counts);
            }
            counts[keys.indexOf(String(row['code']))] = Number(row['attempts'] ?? 0);
        }
        return {
            range,
            by: 'metric',
            keys,
            buckets: [...byBucket.entries()].map(([bucket, counts]) => ({ bucket, counts })),
        };
    }
    async getConnectionBreakdown(params) {
        const empty = {
            attempts: 0,
            succeeded: 0,
            failed: 0,
            fallback_retries: 0,
            fallback_retries_succeeded: 0,
            autofix_attempts: 0,
            autofix_attempts_succeeded: 0,
        };
        if (!params.tenantId)
            return empty;
        const range = params.range ?? '7d';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const okExpr = (0, query_helpers_1.sqlIsSuccessStatus)('at.status');
        const qb = this.attemptRepo
            .createQueryBuilder('at')
            .select('COUNT(*)', 'attempts')
            .addSelect(`COUNT(*) FILTER (WHERE ${okExpr})`, 'succeeded')
            .addSelect(`COUNT(*) FILTER (WHERE at.fallback_from_model IS NOT NULL)`, 'fallback_retries')
            .addSelect(`COUNT(*) FILTER (WHERE at.fallback_from_model IS NOT NULL AND ${okExpr})`, 'fallback_retries_succeeded')
            .addSelect(`COUNT(*) FILTER (WHERE at.autofix_role = 'retry')`, 'autofix_attempts')
            .addSelect(`COUNT(*) FILTER (WHERE at.autofix_role = 'retry' AND ${okExpr})`, 'autofix_attempts_succeeded')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        this.scopeToConnectionWithLegacyFold(qb, params);
        const row = await qb.getRawOne();
        const attempts = Number(row?.attempts ?? 0);
        const succeeded = Number(row?.succeeded ?? 0);
        return {
            attempts,
            succeeded,
            failed: attempts - succeeded,
            fallback_retries: Number(row?.fallback_retries ?? 0),
            fallback_retries_succeeded: Number(row?.fallback_retries_succeeded ?? 0),
            autofix_attempts: Number(row?.autofix_attempts ?? 0),
            autofix_attempts_succeeded: Number(row?.autofix_attempts_succeeded ?? 0),
        };
    }
    async queryWindow(from, to, tenantId, agentScope) {
        const qb = this.attemptRepo
            .createQueryBuilder('at')
            .select('COUNT(*)', 'attempts')
            .addSelect('COUNT(*) FILTER (WHERE at.fallback_from_model IS NOT NULL)', 'fallbacked_attempts')
            .where('at.timestamp >= :from', { from })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
        if (to)
            qb.andWhere('at.timestamp < :to', { to });
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const row = await qb.getRawOne();
        return {
            attempts: Number(row?.['attempts'] ?? 0),
            fallbacked_attempts: Number(row?.['fallbacked_attempts'] ?? 0),
        };
    }
};
exports.AttemptStatsService = AttemptStatsService;
exports.AttemptStatsService = AttemptStatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AttemptStatsService);
//# sourceMappingURL=attempt-stats.service.js.map