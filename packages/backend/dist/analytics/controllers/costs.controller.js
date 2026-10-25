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
exports.CostsController = void 0;
const analytics_scope_service_1 = require("../services/analytics-scope.service");
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const range_query_dto_1 = require("../../common/dto/range-query.dto");
const aggregation_service_1 = require("../services/aggregation.service");
const timeseries_queries_service_1 = require("../services/timeseries-queries.service");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const user_cache_interceptor_1 = require("../../common/interceptors/user-cache.interceptor");
const cache_constants_1 = require("../../common/constants/cache.constants");
const query_helpers_1 = require("../services/query-helpers");
let CostsController = class CostsController {
    analyticsScope;
    aggregation;
    timeseries;
    constructor(analyticsScope, aggregation, timeseries) {
        this.analyticsScope = analyticsScope;
        this.aggregation = aggregation;
        this.timeseries = timeseries;
    }
    async getCosts(query, ctx) {
        const range = query.range ?? '7d';
        const agentScope = await this.analyticsScope.resolve(ctx.tenantId, query.agent_name);
        const [{ costUsage: hourly }, { costUsage: daily }, byModel, prevCost] = await Promise.all([
            this.timeseries.getTimeseries(range, ctx.tenantId, true, agentScope),
            this.timeseries.getTimeseries(range, ctx.tenantId, false, agentScope),
            this.timeseries.getCostByModel(range, ctx.tenantId, agentScope),
            this.aggregation.getPreviousCostTotal(range, ctx.tenantId, agentScope),
        ]);
        const currentCost = hourly.reduce((s, h) => s + h.cost, 0);
        return {
            summary: {
                weekly_cost: {
                    value: currentCost,
                    trend_pct: (0, query_helpers_1.computeTrend)(currentCost, prevCost),
                },
            },
            daily,
            hourly,
            by_model: byModel,
        };
    }
};
exports.CostsController = CostsController;
__decorate([
    (0, common_1.Get)('costs'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], CostsController.prototype, "getCosts", null);
exports.CostsController = CostsController = __decorate([
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseInterceptors)(user_cache_interceptor_1.UserCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.DASHBOARD_CACHE_TTL_MS),
    __metadata("design:paramtypes", [analytics_scope_service_1.AnalyticsScopeService,
        aggregation_service_1.AggregationService,
        timeseries_queries_service_1.TimeseriesQueriesService])
], CostsController);
//# sourceMappingURL=costs.controller.js.map