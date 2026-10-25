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
exports.AggregationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const range_util_1 = require("../../common/utils/range.util");
const query_helpers_1 = require("./query-helpers");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const request_entity_1 = require("../../entities/request.entity");
const agent_usage_daily_service_1 = require("./agent-usage-daily.service");
let AggregationService = class AggregationService {
    turnRepo;
    requestRepo;
    agentUsageDaily;
    constructor(turnRepo, requestRepo, agentUsageDaily) {
        this.turnRepo = turnRepo;
        this.requestRepo = requestRepo;
        this.agentUsageDaily = agentUsageDaily;
    }
    async hasAnyData(tenantId, agentScope, excludePlayground = false, excludeDirect = false) {
        const attemptQb = this.turnRepo.createQueryBuilder('at').select('1').limit(1);
        (0, query_helpers_1.addTenantFilter)(attemptQb, tenantId, agentScope);
        if (excludePlayground)
            (0, query_helpers_1.excludePlaygroundAgents)(attemptQb);
        if (excludeDirect)
            (0, query_helpers_1.excludeDirectAttempts)(attemptQb);
        let requestRow = Promise.resolve(null);
        if (this.requestRepo) {
            const requestQb = this.requestRepo.createQueryBuilder('r').select('1').limit(1);
            (0, query_helpers_1.addTenantFilter)(requestQb, tenantId, agentScope, 'r');
            if (excludePlayground)
                requestQb.andWhere((0, query_helpers_1.sqlExcludePlayground)('r'));
            if (excludeDirect)
                requestQb.andWhere((0, query_helpers_1.sqlExcludeDirectRequests)('r'));
            requestRow = requestQb.getRawOne();
        }
        const [attempt, request] = await Promise.all([attemptQb.getRawOne(), requestRow]);
        return attempt != null || request != null;
    }
    async getPreviousTokenTotal(range, tenantId, agentScope) {
        const { cutoff, prevCutoff } = this.computeWindow(range);
        const row = await this.buildPreviousWindowQuery(tenantId, agentScope, cutoff, prevCutoff)
            .select('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'total')
            .getRawOne();
        return Number(row?.total ?? 0);
    }
    async getPreviousCostTotal(range, tenantId, agentScope) {
        const { cutoff, prevCutoff } = this.computeWindow(range);
        const safeCost = (0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd');
        const row = await this.buildPreviousWindowQuery(tenantId, agentScope, cutoff, prevCutoff)
            .select(`COALESCE(SUM(${safeCost}), 0)`, 'total')
            .getRawOne();
        return Number(row?.total ?? 0);
    }
    async getSummaryMetrics(range, tenantId, agentScope, authType, provider, excludePlayground = false, label, tenantProviderId) {
        const { cutoff, prevCutoff } = this.computeWindow(range);
        const safeCost = (0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd');
        const currentQb = this.turnRepo
            .createQueryBuilder('at')
            .select((0, query_helpers_1.sqlCountMessages)(), 'msg_count')
            .addSelect('COALESCE(SUM(at.input_tokens), 0)', 'inp')
            .addSelect('COALESCE(SUM(at.output_tokens), 0)', 'out')
            .addSelect(`COALESCE(SUM(${safeCost}), 0)`, 'cost')
            .where('at.timestamp >= :cutoff', { cutoff });
        (0, query_helpers_1.addTenantFilter)(currentQb, tenantId, agentScope);
        if (authType)
            currentQb.andWhere('at.auth_type = :authType', { authType });
        if (provider)
            currentQb.andWhere('at.provider = :provider', { provider });
        if (excludePlayground)
            (0, query_helpers_1.excludePlaygroundAgents)(currentQb);
        (0, query_helpers_1.scopeToConnection)(currentQb, tenantProviderId, label);
        const prevQb = this.buildPreviousWindowQuery(tenantId, agentScope, cutoff, prevCutoff, authType, provider, excludePlayground, label, tenantProviderId)
            .select((0, query_helpers_1.sqlCountMessages)(), 'msg_count')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .addSelect(`COALESCE(SUM(${safeCost}), 0)`, 'cost');
        const [cur, prev] = await Promise.all([currentQb.getRawOne(), prevQb.getRawOne()]);
        const inputTotal = Number(cur?.inp ?? 0);
        const outputTotal = Number(cur?.out ?? 0);
        const curTokens = inputTotal + outputTotal;
        const prevTokens = Number(prev?.tokens ?? 0);
        const curCost = Number(cur?.cost ?? 0);
        const prevCost = Number(prev?.cost ?? 0);
        const curMsgs = Number(cur?.msg_count ?? 0);
        const prevMsgs = Number(prev?.msg_count ?? 0);
        return {
            tokens: {
                tokens_today: {
                    value: curTokens,
                    trend_pct: (0, query_helpers_1.computeTrend)(curTokens, prevTokens),
                    sub_values: { input: inputTotal, output: outputTotal },
                },
                input_tokens: inputTotal,
                output_tokens: outputTotal,
            },
            cost: { value: curCost, trend_pct: (0, query_helpers_1.computeTrend)(curCost, prevCost) },
            messages: { value: curMsgs, trend_pct: (0, query_helpers_1.computeTrend)(curMsgs, prevMsgs) },
        };
    }
    async getPreviousWindowMetrics(range, tenantId, agentScope, excludePlayground = false, excludeDirect = false) {
        if (excludePlayground &&
            this.agentUsageDaily?.supportsRange(tenantId, range) &&
            tenantId !== null) {
            const rows = await this.agentUsageDaily.getRangeRows(tenantId, range, {
                agentScope,
                previous: true,
                excludeDirect,
            });
            return rows.reduce((totals, row) => {
                totals.tokens += Number(row.input_tokens) + Number(row.output_tokens);
                totals.cost += Number(row.cost_usd);
                totals.messages += Number(row.request_count);
                return totals;
            }, { tokens: 0, cost: 0, messages: 0 });
        }
        const { cutoff, prevCutoff } = this.computeWindow(range);
        const safeCost = (0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd');
        const prev = await this.buildPreviousWindowQuery(tenantId, agentScope, cutoff, prevCutoff, undefined, undefined, excludePlayground, undefined, undefined, excludeDirect)
            .select((0, query_helpers_1.sqlCountMessages)(), 'msg_count')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .addSelect(`COALESCE(SUM(${safeCost}), 0)`, 'cost')
            .getRawOne();
        return {
            tokens: Number(prev?.tokens ?? 0),
            cost: Number(prev?.cost ?? 0),
            messages: Number(prev?.msg_count ?? 0),
        };
    }
    async getRequestReliability(range, tenantId, agentScope, excludePlayground = false, excludeDirect = false) {
        if (!tenantId) {
            return {
                total: 0,
                successful: 0,
                success_rate: 0,
                attempt_success_rate: 0,
                manifest_lift_pct: 0,
                recovered: 0,
                previous_total: 0,
            };
        }
        const { cutoff, prevCutoff } = this.computeWindow(range);
        const agentPredicate = (0, query_helpers_1.sqlAgentScope)('r', '$4', agentScope);
        const playgroundPredicate = excludePlayground ? `AND ${(0, query_helpers_1.sqlExcludePlayground)('r')}` : '';
        const unlinkedAgentPredicate = (0, query_helpers_1.sqlAgentScope)('pa', '$4', agentScope);
        const unlinkedPlaygroundPredicate = excludePlayground
            ? `AND ${(0, query_helpers_1.sqlExcludePlayground)('pa')}`
            : '';
        const directPredicate = excludeDirect ? `AND ${(0, query_helpers_1.sqlExcludeDirectRequests)('r')}` : '';
        const unlinkedDirectPredicate = excludeDirect
            ? `AND pa.routing_reason IS DISTINCT FROM 'direct'`
            : '';
        const queryParams = agentScope
            ? [tenantId, prevCutoff, cutoff, agentScope.agentId]
            : [tenantId, prevCutoff, cutoff];
        const rows = (await this.turnRepo.query(`WITH scoped_requests AS (
         SELECT r.id, r.timestamp, r.status
         FROM requests r
         WHERE r.tenant_id = $1
           AND r.timestamp >= $2
           AND ${(0, query_helpers_1.sqlIsCompletedStatus)('r.status')}
           ${agentPredicate}
           ${playgroundPredicate}
           ${directPredicate}
         UNION ALL
         SELECT 'unlinked:' || pa.id, pa.timestamp, pa.status
         FROM agent_messages pa
         WHERE pa.request_id IS NULL
           AND pa.tenant_id = $1
           AND pa.timestamp >= $2
           AND ${(0, query_helpers_1.sqlIsCompletedStatus)('pa.status')}
           ${unlinkedAgentPredicate}
           ${unlinkedPlaygroundPredicate}
           ${unlinkedDirectPredicate}
       ), attempt_stats AS (
         SELECT pa.request_id,
                COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsCompletedStatus)('pa.status')}) AS attempts,
                COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('pa.status')}) AS successful_attempts,
                BOOL_OR(${(0, query_helpers_1.sqlIsFailedStatus)('pa.status')}) AS had_failure
         FROM agent_messages pa
         JOIN scoped_requests r ON r.id = pa.request_id
         GROUP BY pa.request_id
         UNION ALL
         SELECT r.id,
                1 AS attempts,
                CASE WHEN ${(0, query_helpers_1.sqlIsSuccessStatus)('pa.status')} THEN 1 ELSE 0 END AS successful_attempts,
                ${(0, query_helpers_1.sqlIsFailedStatus)('pa.status')} AS had_failure
         FROM agent_messages pa
         JOIN scoped_requests r ON r.id = 'unlinked:' || pa.id
         WHERE pa.request_id IS NULL
       )
       SELECT
         COUNT(*) FILTER (WHERE r.timestamp >= $3)::int AS total,
         COUNT(*) FILTER (WHERE r.timestamp >= $3 AND ${(0, query_helpers_1.sqlIsSuccessStatus)('r.status')})::int AS successful,
         COUNT(*) FILTER (WHERE r.timestamp < $3)::int AS previous_total,
         COALESCE(SUM(a.attempts) FILTER (WHERE r.timestamp >= $3), 0)::int AS attempts,
         COALESCE(SUM(a.successful_attempts) FILTER (WHERE r.timestamp >= $3), 0)::int AS successful_attempts,
         COUNT(*) FILTER (WHERE r.timestamp >= $3 AND ${(0, query_helpers_1.sqlIsSuccessStatus)('r.status')} AND a.had_failure)::int AS recovered
       FROM scoped_requests r
       LEFT JOIN attempt_stats a ON a.request_id = r.id`, queryParams));
        const row = rows[0];
        const total = Number(row?.total ?? 0);
        const successful = Number(row?.successful ?? 0);
        const attempts = Number(row?.attempts ?? 0);
        const successfulAttempts = Number(row?.successful_attempts ?? 0);
        const successRate = total === 0 ? 0 : (successful / total) * 100;
        const attemptSuccessRate = attempts === 0 ? 0 : (successfulAttempts / attempts) * 100;
        return {
            total,
            successful,
            success_rate: successRate,
            attempt_success_rate: attemptSuccessRate,
            manifest_lift_pct: successRate - attemptSuccessRate,
            recovered: Number(row?.recovered ?? 0),
            previous_total: Number(row?.previous_total ?? 0),
        };
    }
    static buildSummary(current, previous) {
        const curTokens = current.input + current.output;
        return {
            tokens: {
                tokens_today: {
                    value: curTokens,
                    trend_pct: (0, query_helpers_1.computeTrend)(curTokens, previous.tokens),
                    sub_values: { input: current.input, output: current.output },
                },
                input_tokens: current.input,
                output_tokens: current.output,
            },
            cost: { value: current.cost, trend_pct: (0, query_helpers_1.computeTrend)(current.cost, previous.cost) },
            messages: {
                value: current.messages,
                trend_pct: (0, query_helpers_1.computeTrend)(current.messages, previous.messages),
            },
        };
    }
    computeWindow(range) {
        return {
            cutoff: (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range)),
            prevCutoff: (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToPreviousInterval)(range)),
        };
    }
    buildPreviousWindowQuery(tenantId, agentScope, cutoff, prevCutoff, authType, provider, excludePlayground = false, label, tenantProviderId, excludeDirect = false) {
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .where('at.timestamp >= :prevCutoff', { prevCutoff })
            .andWhere('at.timestamp < :cutoff', { cutoff });
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (authType)
            qb.andWhere('at.auth_type = :authType', { authType });
        if (provider)
            qb.andWhere('at.provider = :provider', { provider });
        if (excludePlayground)
            (0, query_helpers_1.excludePlaygroundAgents)(qb);
        if (excludeDirect)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        (0, query_helpers_1.scopeToConnection)(qb, tenantProviderId, label);
        return qb;
    }
};
exports.AggregationService = AggregationService;
exports.AggregationService = AggregationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, typeorm_1.InjectRepository)(request_entity_1.ManifestRequest)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        agent_usage_daily_service_1.AgentUsageDailyService])
], AggregationService);
//# sourceMappingURL=aggregation.service.js.map