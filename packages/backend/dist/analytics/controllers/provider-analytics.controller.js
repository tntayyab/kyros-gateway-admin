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
exports.ProviderAnalyticsController = void 0;
const analytics_scope_service_1 = require("../services/analytics-scope.service");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const aggregation_service_1 = require("../services/aggregation.service");
const autofix_stats_service_1 = require("../services/autofix-stats.service");
const attempt_stats_service_1 = require("../services/attempt-stats.service");
const timeseries_queries_service_1 = require("../services/timeseries-queries.service");
const tenant_provider_entity_1 = require("../../entities/tenant-provider.entity");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const query_helpers_1 = require("../services/query-helpers");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const postgres_sql_2 = require("../../common/utils/postgres-sql");
const range_util_1 = require("../../common/utils/range.util");
let ProviderAnalyticsController = class ProviderAnalyticsController {
    analyticsScope;
    aggregation;
    timeseries;
    autofixStats;
    attemptStats;
    providerRepo;
    messageRepo;
    constructor(analyticsScope, aggregation, timeseries, autofixStats, attemptStats, providerRepo, messageRepo) {
        this.analyticsScope = analyticsScope;
        this.aggregation = aggregation;
        this.timeseries = timeseries;
        this.autofixStats = autofixStats;
        this.attemptStats = attemptStats;
        this.providerRepo = providerRepo;
        this.messageRepo = messageRepo;
    }
    async getAttemptStatusTimeseries(ctx, range, authType, provider, label, connectionId) {
        return this.attemptStats.getConnectionStatusTimeseries({
            tenantId: ctx.tenantId,
            range,
            authType,
            provider,
            label,
            tenantProviderId: connectionId,
        });
    }
    async getAttemptHttpStatusTimeseries(ctx, range, authType, provider, label, connectionId) {
        return this.attemptStats.getConnectionHttpStatusTimeseries({
            tenantId: ctx.tenantId,
            range,
            authType,
            provider,
            label,
            tenantProviderId: connectionId,
        });
    }
    async getAttemptBreakdown(ctx, range, authType, provider, label, connectionId) {
        return this.attemptStats.getConnectionBreakdown({
            tenantId: ctx.tenantId,
            range,
            authType,
            provider,
            label,
            tenantProviderId: connectionId,
        });
    }
    async getAttemptsByAgentTimeseries(ctx, range, authType, provider, label, connectionId) {
        return this.attemptStats.getConnectionAttemptsByAgentTimeseries({
            tenantId: ctx.tenantId,
            range,
            authType,
            provider,
            label,
            tenantProviderId: connectionId,
        });
    }
    async getAnalytics(ctx, authType, range, agentName, provider, label, connectionId) {
        const validRange = this.validateRange(range);
        const hourly = validRange === '24h';
        const agent = await this.analyticsScope.resolve(ctx.tenantId, agentName);
        const [summary, ts, attempts] = await Promise.all([
            this.aggregation.getSummaryMetrics(validRange, ctx.tenantId, agent, authType, provider, true, label, connectionId),
            this.timeseries.getTimeseries(validRange, ctx.tenantId, hourly, agent, authType, provider, true, label, connectionId),
            this.getAttemptReliability(validRange, ctx.tenantId, agent, authType, provider, label, connectionId),
        ]);
        return {
            summary: {
                messages: summary.messages,
                tokens: summary.tokens.tokens_today,
            },
            token_usage: ts.tokenUsage,
            message_usage: ts.messageUsage,
            attempts,
        };
    }
    async getAttemptReliability(range, tenantId, agentScope, authType, provider, label, connectionId) {
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .select('COUNT(*)', 'total')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')})`, 'successful')
            .where('at.timestamp >= :attemptCutoff', {
            attemptCutoff: (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range)),
        })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (authType)
            qb.andWhere('at.auth_type = :attemptAuthType', { attemptAuthType: authType });
        if (provider)
            qb.andWhere('at.provider = :attemptProvider', { attemptProvider: provider });
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.scopeToConnection)(qb, connectionId, label);
        const row = await qb.getRawOne();
        const total = Number(row?.total ?? 0);
        const successful = Number(row?.successful ?? 0);
        return {
            total,
            successful,
            success_rate: total === 0 ? 0 : (successful / total) * 100,
        };
    }
    async getPerAgentTimeseries(ctx, authType, provider, range, label, connectionId) {
        const validRange = this.validateRange(range);
        const hourly = validRange === '24h';
        return this.timeseries.getPerAgentTimeseries(validRange, ctx.tenantId, hourly, authType, provider, label, connectionId);
    }
    async getPerAgentMessageTimeseries(ctx, authType, provider, range, label, connectionId) {
        const validRange = this.validateRange(range);
        const hourly = validRange === '24h';
        return this.timeseries.getPerAgentMessageTimeseries(validRange, ctx.tenantId, hourly, authType, provider, label, connectionId);
    }
    async getPerAgentCostTimeseries(ctx, authType, provider, range, label, connectionId) {
        const validRange = this.validateRange(range);
        const hourly = validRange === '24h';
        return this.timeseries.getPerAgentCostTimeseries(validRange, ctx.tenantId, hourly, authType, provider, label, connectionId);
    }
    async getAgents(ctx, authType) {
        const agents = await this.timeseries.getAgentNamesByAuthType(authType ?? 'subscription', ctx.tenantId);
        return { agents };
    }
    async getConnectionDetail(ctx, connectionId) {
        if (!connectionId || !ctx.tenantId)
            return { connection: null, agents: [], model_usage: [], recent_messages: [] };
        const tenantId = ctx.tenantId;
        const conn = await this.providerRepo.findOne({
            where: { id: connectionId, tenant_id: tenantId },
        });
        if (!conn)
            return { connection: null, agents: [], model_usage: [], recent_messages: [] };
        const cutoff30d = (0, postgres_sql_1.computeCutoff)('30 days');
        const costExpr = (0, postgres_sql_2.sqlCastFloat)((0, postgres_sql_2.sqlSanitizeCost)('at.cost_usd'));
        const connId = conn.id;
        const lastUsedRow = await (0, query_helpers_1.filterByTenantProviderId)(this.messageRepo
            .createQueryBuilder('at')
            .select('MAX(at.timestamp)', 'last_used_at')
            .where('at.tenant_id = :tid', { tid: tenantId }), connId).getRawOne();
        const lastUsedAt = lastUsedRow?.last_used_at instanceof Date
            ? lastUsedRow.last_used_at.toISOString()
            : lastUsedRow?.last_used_at
                ? String(lastUsedRow.last_used_at)
                : null;
        const agentQb = this.messageRepo
            .createQueryBuilder('at')
            .select('at.agent_name', 'agent_name')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .addSelect('MAX(at.timestamp)', 'last_used')
            .addSelect('MAX(a.agent_platform)', 'agent_platform')
            .addSelect('COUNT(*)', 'attempts')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')})`, 'succeeded')
            .leftJoin('agents', 'a', 'a.id = at.agent_id')
            .where('at.tenant_id = :tid', { tid: tenantId })
            .andWhere('at.timestamp >= :cutoff', { cutoff: cutoff30d })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'))
            .andWhere('at.agent_name IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(agentQb);
        (0, query_helpers_1.filterByTenantProviderId)(agentQb, connId);
        const agentRows = await agentQb.groupBy('at.agent_name').orderBy('tokens', 'DESC').getRawMany();
        const modelQb = this.messageRepo
            .createQueryBuilder('at')
            .select('at.model', 'model')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .where('at.tenant_id = :tid', { tid: tenantId })
            .andWhere('at.timestamp >= :cutoff', { cutoff: cutoff30d })
            .andWhere('at.model IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(modelQb);
        (0, query_helpers_1.filterByTenantProviderId)(modelQb, connId);
        const modelRows = await modelQb.groupBy('at.model').orderBy('tokens', 'DESC').getRawMany();
        const totalModelTokens = modelRows.reduce((sum, r) => sum + Number(r['tokens'] ?? 0), 0);
        const msgQb = (0, query_helpers_1.selectMessageRowColumns)(this.messageRepo.createQueryBuilder('at'), costExpr).where('at.tenant_id = :tid', { tid: tenantId });
        (0, query_helpers_1.excludePlaygroundAgents)(msgQb);
        (0, query_helpers_1.filterByTenantProviderId)(msgQb, connId);
        const recentMessages = await msgQb.orderBy('at.timestamp', 'DESC').limit(5).getRawMany();
        return {
            connection: {
                id: conn.id,
                provider: conn.provider,
                auth_type: conn.auth_type,
                label: conn.label,
                cached_model_count: Array.isArray(conn.cached_models) ? conn.cached_models.length : 0,
                key_prefix: conn.key_prefix,
                connected_at: conn.connected_at,
                is_active: conn.is_active,
                last_used_at: lastUsedAt,
            },
            agents: (() => {
                const totalAgentTokens = agentRows.reduce((sum, r) => sum + Number(r['tokens'] ?? 0), 0);
                return agentRows.map((r) => {
                    const tokens = Number(r['tokens'] ?? 0);
                    return {
                        agent_name: String(r['agent_name']),
                        agent_platform: r['agent_platform'] ? String(r['agent_platform']) : null,
                        tokens_30d: tokens,
                        cost_30d: Number(r['cost'] ?? 0),
                        messages_30d: Number(r['messages'] ?? 0),
                        attempts_30d: Number(r['attempts'] ?? 0),
                        succeeded_30d: Number(r['succeeded'] ?? 0),
                        pct_of_total: totalAgentTokens > 0 ? Math.round((tokens / totalAgentTokens) * 100) : 0,
                        last_used: r['last_used']
                            ? r['last_used'] instanceof Date
                                ? r['last_used'].toISOString()
                                : String(r['last_used'])
                            : null,
                    };
                });
            })(),
            model_usage: modelRows.map((r) => {
                const tokens = Number(r['tokens'] ?? 0);
                return {
                    model: String(r['model']),
                    tokens,
                    cost: Number(r['cost'] ?? 0),
                    messages: Number(r['messages'] ?? 0),
                    pct_of_total: totalModelTokens > 0 ? Math.round((tokens / totalModelTokens) * 100) : 0,
                };
            }),
            recent_messages: recentMessages,
        };
    }
    validateRange(range) {
        return range === '7d' || range === '30d' || range === '90d' || range === '365d' ? range : '24h';
    }
};
exports.ProviderAnalyticsController = ProviderAnalyticsController;
__decorate([
    (0, common_1.Get)('attempt-status-timeseries'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('range')),
    __param(2, (0, common_1.Query)('auth_type')),
    __param(3, (0, common_1.Query)('provider')),
    __param(4, (0, common_1.Query)('label')),
    __param(5, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getAttemptStatusTimeseries", null);
__decorate([
    (0, common_1.Get)('attempt-http-status-timeseries'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('range')),
    __param(2, (0, common_1.Query)('auth_type')),
    __param(3, (0, common_1.Query)('provider')),
    __param(4, (0, common_1.Query)('label')),
    __param(5, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getAttemptHttpStatusTimeseries", null);
__decorate([
    (0, common_1.Get)('attempt-breakdown'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('range')),
    __param(2, (0, common_1.Query)('auth_type')),
    __param(3, (0, common_1.Query)('provider')),
    __param(4, (0, common_1.Query)('label')),
    __param(5, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getAttemptBreakdown", null);
__decorate([
    (0, common_1.Get)('attempts-by-agent-timeseries'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('range')),
    __param(2, (0, common_1.Query)('auth_type')),
    __param(3, (0, common_1.Query)('provider')),
    __param(4, (0, common_1.Query)('label')),
    __param(5, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getAttemptsByAgentTimeseries", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('auth_type')),
    __param(2, (0, common_1.Query)('range')),
    __param(3, (0, common_1.Query)('agent_name')),
    __param(4, (0, common_1.Query)('provider')),
    __param(5, (0, common_1.Query)('label')),
    __param(6, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('per-agent-timeseries'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('auth_type')),
    __param(2, (0, common_1.Query)('provider')),
    __param(3, (0, common_1.Query)('range')),
    __param(4, (0, common_1.Query)('label')),
    __param(5, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getPerAgentTimeseries", null);
__decorate([
    (0, common_1.Get)('per-agent-message-timeseries'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('auth_type')),
    __param(2, (0, common_1.Query)('provider')),
    __param(3, (0, common_1.Query)('range')),
    __param(4, (0, common_1.Query)('label')),
    __param(5, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getPerAgentMessageTimeseries", null);
__decorate([
    (0, common_1.Get)('per-agent-cost-timeseries'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('auth_type')),
    __param(2, (0, common_1.Query)('provider')),
    __param(3, (0, common_1.Query)('range')),
    __param(4, (0, common_1.Query)('label')),
    __param(5, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getPerAgentCostTimeseries", null);
__decorate([
    (0, common_1.Get)('agents'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('auth_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Get)('connection-detail'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('connection_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProviderAnalyticsController.prototype, "getConnectionDetail", null);
exports.ProviderAnalyticsController = ProviderAnalyticsController = __decorate([
    (0, common_1.Controller)('api/v1/provider-analytics'),
    __param(5, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(6, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [analytics_scope_service_1.AnalyticsScopeService,
        aggregation_service_1.AggregationService,
        timeseries_queries_service_1.TimeseriesQueriesService,
        autofix_stats_service_1.AutofixStatsService,
        attempt_stats_service_1.AttemptStatsService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProviderAnalyticsController);
//# sourceMappingURL=provider-analytics.controller.js.map