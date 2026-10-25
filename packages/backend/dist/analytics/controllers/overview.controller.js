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
exports.OverviewController = void 0;
const analytics_scope_service_1 = require("../services/analytics-scope.service");
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const range_query_dto_1 = require("../../common/dto/range-query.dto");
const range_util_1 = require("../../common/utils/range.util");
const aggregation_service_1 = require("../services/aggregation.service");
const timeseries_queries_service_1 = require("../services/timeseries-queries.service");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const user_cache_interceptor_1 = require("../../common/interceptors/user-cache.interceptor");
const cache_constants_1 = require("../../common/constants/cache.constants");
const provider_service_1 = require("../../routing/routing-core/provider.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_enabled_provider_entity_1 = require("../../entities/agent-enabled-provider.entity");
const query_helpers_1 = require("../services/query-helpers");
const messages_query_service_1 = require("../services/messages-query.service");
const overview_query_dto_1 = require("../dto/overview-query.dto");
function sumTimeseries(tsData) {
    let input = 0;
    let output = 0;
    for (const b of tsData.tokenUsage) {
        input += b.input_tokens;
        output += b.output_tokens;
    }
    const cost = tsData.costUsage.reduce((sum, b) => sum + b.cost, 0);
    const messages = tsData.messageUsage.reduce((sum, b) => sum + b.count, 0);
    return { input, output, cost, messages };
}
let OverviewController = class OverviewController {
    analyticsScope;
    aggregation;
    timeseries;
    providerService;
    enabledProviderRepo;
    messagesQuery;
    constructor(analyticsScope, aggregation, timeseries, providerService, enabledProviderRepo, messagesQuery) {
        this.analyticsScope = analyticsScope;
        this.aggregation = aggregation;
        this.timeseries = timeseries;
        this.providerService = providerService;
        this.enabledProviderRepo = enabledProviderRepo;
        this.messagesQuery = messagesQuery;
    }
    async getOverview(query, ctx) {
        const range = query.range ?? '24h';
        const agentScope = await this.analyticsScope.resolve(ctx.tenantId, query.agent_name);
        const fast = query.fast === 'true';
        const hourly = (0, range_util_1.isHourlyRange)(range);
        const tenantId = ctx.tenantId;
        const excludeDirect = !!agentScope;
        const [prevMetrics, requestReliability, tsData, costByModel, recentActivity, activeSkills, hasData, hasProviders,] = await Promise.all([
            this.aggregation.getPreviousWindowMetrics(range, tenantId, agentScope, true, excludeDirect),
            fast
                ? Promise.resolve(null)
                : this.aggregation.getRequestReliability(range, tenantId, agentScope, true, excludeDirect),
            this.timeseries.getTimeseries(range, tenantId, hourly, agentScope, undefined, undefined, true, undefined, undefined, excludeDirect),
            fast
                ? Promise.resolve([])
                : this.timeseries.getCostByModel(range, tenantId, agentScope, true, excludeDirect),
            fast
                ? Promise.resolve([])
                : this.getRecentActivity(range, tenantId, agentScope, excludeDirect),
            fast
                ? Promise.resolve([])
                : this.timeseries.getActiveSkills(range, tenantId, agentScope, true, excludeDirect),
            this.aggregation.hasAnyData(tenantId, agentScope, true, excludeDirect),
            this.hasActiveProviders(tenantId, agentScope),
        ]);
        const summary = aggregation_service_1.AggregationService.buildSummary(sumTimeseries(tsData), prevMetrics);
        if (requestReliability) {
            summary.messages = {
                value: requestReliability.total,
                trend_pct: (0, query_helpers_1.computeTrend)(requestReliability.total, requestReliability.previous_total),
            };
        }
        return {
            summary: {
                tokens_today: summary.tokens.tokens_today,
                cost_today: summary.cost,
                messages: summary.messages,
                services_hit: { total: 0, healthy: 0, issues: 0 },
            },
            token_usage: tsData.tokenUsage,
            cost_usage: tsData.costUsage,
            message_usage: tsData.messageUsage,
            cost_by_model: costByModel,
            recent_activity: recentActivity,
            active_skills: activeSkills,
            request_reliability: requestReliability,
            has_data: hasData,
            has_providers: hasProviders,
        };
    }
    async getOverviewDetails(query, ctx) {
        const range = query.range ?? '24h';
        const agentScope = await this.analyticsScope.resolve(ctx.tenantId, query.agent_name);
        const excludeDirect = !!agentScope;
        const [costByModel, recentActivity, requestReliability, activeSkills] = await Promise.all([
            this.timeseries.getCostByModel(range, ctx.tenantId, agentScope, true, excludeDirect),
            this.getRecentActivity(range, ctx.tenantId, agentScope, excludeDirect),
            this.aggregation.getRequestReliability(range, ctx.tenantId, agentScope, true, excludeDirect),
            this.timeseries.getActiveSkills(range, ctx.tenantId, agentScope, true, excludeDirect),
        ]);
        return {
            cost_by_model: costByModel,
            recent_activity: recentActivity,
            request_reliability: requestReliability,
            active_skills: activeSkills,
        };
    }
    async getPerAgentTimeseries(query, ctx) {
        const { range, hourly } = this.deriveTimeseriesArgs(query);
        return this.timeseries.getPerAgentTimeseries(range, ctx.tenantId, hourly);
    }
    async getPerAgentMessageTimeseries(query, ctx) {
        const { range, hourly } = this.deriveTimeseriesArgs(query);
        return this.timeseries.getPerAgentMessageTimeseries(range, ctx.tenantId, hourly);
    }
    async getPerAgentCostTimeseries(query, ctx) {
        const { range, hourly } = this.deriveTimeseriesArgs(query);
        return this.timeseries.getPerAgentCostTimeseries(range, ctx.tenantId, hourly);
    }
    async getOverviewAgentsUsage(query, ctx) {
        const { range, hourly } = this.deriveTimeseriesArgs(query);
        return this.timeseries.getAgentUsageTimeseries(range, ctx.tenantId, hourly);
    }
    async getPerProviderTimeseries(query, ctx) {
        const { range, hourly, agentScope } = await this.deriveScopedTimeseriesArgs(query, ctx.tenantId);
        return this.timeseries.getPerProviderTimeseries(range, ctx.tenantId, hourly, agentScope);
    }
    async getPerProviderMessageTimeseries(query, ctx) {
        const { range, hourly, agentScope } = await this.deriveScopedTimeseriesArgs(query, ctx.tenantId);
        return this.timeseries.getPerProviderMessageTimeseries(range, ctx.tenantId, hourly, agentScope);
    }
    async getPerProviderCostTimeseries(query, ctx) {
        const { range, hourly, agentScope } = await this.deriveScopedTimeseriesArgs(query, ctx.tenantId);
        return this.timeseries.getPerProviderCostTimeseries(range, ctx.tenantId, hourly, agentScope);
    }
    async getOverviewProvidersUsage(query, ctx) {
        const { range, hourly, agentScope } = await this.deriveScopedTimeseriesArgs(query, ctx.tenantId);
        return this.timeseries.getProviderUsageTimeseries(range, ctx.tenantId, hourly, agentScope);
    }
    async getPerModelCostTimeseries(query, ctx) {
        const { range, hourly, agentScope } = await this.deriveScopedTimeseriesArgs(query, ctx.tenantId);
        return this.timeseries.getPerModelCostTimeseries(range, ctx.tenantId, hourly, agentScope);
    }
    async getPerModelTimeseries(query, ctx) {
        const { range, hourly, agentScope } = await this.deriveScopedTimeseriesArgs(query, ctx.tenantId);
        return this.timeseries.getPerModelTimeseries(range, ctx.tenantId, hourly, agentScope);
    }
    async getPerModelMessageTimeseries(query, ctx) {
        const { range, hourly, agentScope } = await this.deriveScopedTimeseriesArgs(query, ctx.tenantId);
        return this.timeseries.getPerModelMessageTimeseries(range, ctx.tenantId, hourly, agentScope);
    }
    deriveTimeseriesArgs(query) {
        const range = query.range ?? '24h';
        return { range, hourly: (0, range_util_1.isHourlyRange)(range) };
    }
    async deriveScopedTimeseriesArgs(query, tenantId) {
        return {
            ...this.deriveTimeseriesArgs(query),
            agentScope: await this.analyticsScope.resolve(tenantId, query.agent_name),
        };
    }
    async hasActiveProviders(tenantId, agentScope) {
        if (!agentScope?.agentId || !tenantId)
            return false;
        try {
            const providers = await this.providerService.getProviders(tenantId);
            const activeProviderIds = new Set(providers.filter((p) => p.is_active).map((p) => p.id));
            if (activeProviderIds.size === 0)
                return false;
            const enabledRows = await this.enabledProviderRepo.find({
                where: { agent_id: agentScope.agentId },
            });
            return enabledRows.some((row) => activeProviderIds.has(row.tenant_provider_id));
        }
        catch {
            return false;
        }
    }
    getRecentActivity(range, tenantId, agentScope, excludeDirect) {
        return this.messagesQuery
            ? this.messagesQuery
                .getMessages({
                range,
                tenantId,
                agent_name: agentScope?.agentName,
                agentScope,
                limit: 5,
                include_total: false,
                include_filter_options: false,
                exclude_playground: true,
                exclude_direct: excludeDirect,
            })
                .then((result) => result.items)
            : this.timeseries.getRecentActivity(range, tenantId, 5, agentScope, true, excludeDirect);
    }
};
exports.OverviewController = OverviewController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [overview_query_dto_1.OverviewQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('overview/details'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getOverviewDetails", null);
__decorate([
    (0, common_1.Get)('overview/per-agent-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerAgentTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/per-agent-message-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerAgentMessageTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/per-agent-cost-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerAgentCostTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/agents/usage'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getOverviewAgentsUsage", null);
__decorate([
    (0, common_1.Get)('overview/per-provider-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerProviderTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/per-provider-message-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerProviderMessageTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/per-provider-cost-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerProviderCostTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/providers/usage'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getOverviewProvidersUsage", null);
__decorate([
    (0, common_1.Get)('overview/per-model-cost-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerModelCostTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/per-model-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerModelTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/per-model-message-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OverviewController.prototype, "getPerModelMessageTimeseries", null);
exports.OverviewController = OverviewController = __decorate([
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseInterceptors)(user_cache_interceptor_1.UserCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.DASHBOARD_CACHE_TTL_MS),
    __param(4, (0, typeorm_1.InjectRepository)(agent_enabled_provider_entity_1.AgentEnabledProvider)),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [analytics_scope_service_1.AnalyticsScopeService,
        aggregation_service_1.AggregationService,
        timeseries_queries_service_1.TimeseriesQueriesService,
        provider_service_1.ProviderService,
        typeorm_2.Repository,
        messages_query_service_1.MessagesQueryService])
], OverviewController);
//# sourceMappingURL=overview.controller.js.map