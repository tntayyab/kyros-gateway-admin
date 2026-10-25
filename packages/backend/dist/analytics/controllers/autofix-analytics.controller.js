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
exports.AutofixAnalyticsController = void 0;
const analytics_scope_service_1 = require("../services/analytics-scope.service");
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const class_validator_1 = require("class-validator");
const range_query_dto_1 = require("../../common/dto/range-query.dto");
const autofix_stats_service_1 = require("../services/autofix-stats.service");
const autofix_stats_service_2 = require("../services/autofix-stats.service");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const user_cache_interceptor_1 = require("../../common/interceptors/user-cache.interceptor");
const cache_constants_1 = require("../../common/constants/cache.constants");
class AutofixTimeseriesQueryDto extends range_query_dto_1.RangeQueryDto {
    by;
    failed_only;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)([...autofix_stats_service_1.AUTOFIX_TS_DIMENSIONS]),
    __metadata("design:type", String)
], AutofixTimeseriesQueryDto.prototype, "by", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutofixTimeseriesQueryDto.prototype, "failed_only", void 0);
let AutofixAnalyticsController = class AutofixAnalyticsController {
    analyticsScope;
    autofixStats;
    cacheManager;
    constructor(analyticsScope, autofixStats, cacheManager) {
        this.analyticsScope = analyticsScope;
        this.autofixStats = autofixStats;
        this.cacheManager = cacheManager;
    }
    async getStatus(ctx) {
        return this.autofixStats.getWorkspaceStatus(ctx.tenantId);
    }
    async enableAll(ctx) {
        if (!ctx.tenantId) {
            throw new common_1.BadRequestException('No workspace resolved');
        }
        const result = await this.autofixStats.enableAll(ctx.tenantId);
        await this.cacheManager.del(`${ctx.tenantId}:/api/v1/autofix/status`);
        return result;
    }
    async getStats(query, ctx) {
        return this.autofixStats.getStats({
            tenantId: ctx.tenantId,
            range: query.range,
            agentScope: await this.analyticsScope.resolve(ctx.tenantId, query.agent_name),
        });
    }
    async getTimeseries(query, ctx) {
        return this.autofixStats.getTimeseries({
            tenantId: ctx.tenantId,
            range: query.range,
            by: query.by,
            agentScope: await this.analyticsScope.resolve(ctx.tenantId, query.agent_name),
            failedOnly: query.failed_only === 'true',
        });
    }
    async getPerAgent(query, ctx) {
        return this.autofixStats.getPerAgentStats({
            tenantId: ctx.tenantId,
            range: query.range,
        });
    }
    async getPerProvider(query, ctx) {
        return this.autofixStats.getPerProviderStats({
            tenantId: ctx.tenantId,
            range: query.range,
            agentScope: await this.analyticsScope.resolve(ctx.tenantId, query.agent_name),
        });
    }
    async getPerModel(query, ctx) {
        return this.autofixStats.getPerModelStats({
            tenantId: ctx.tenantId,
            range: query.range,
            agentScope: await this.analyticsScope.resolve(ctx.tenantId, query.agent_name),
        });
    }
};
exports.AutofixAnalyticsController = AutofixAnalyticsController;
__decorate([
    (0, common_1.Get)('autofix/status'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutofixAnalyticsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('autofix/enable-all'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutofixAnalyticsController.prototype, "enableAll", null);
__decorate([
    (0, common_1.Get)('overview/autofix-stats'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AutofixAnalyticsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('overview/autofix-timeseries'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AutofixTimeseriesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AutofixAnalyticsController.prototype, "getTimeseries", null);
__decorate([
    (0, common_1.Get)('overview/autofix-per-agent'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AutofixAnalyticsController.prototype, "getPerAgent", null);
__decorate([
    (0, common_1.Get)('overview/autofix-per-provider'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AutofixAnalyticsController.prototype, "getPerProvider", null);
__decorate([
    (0, common_1.Get)('overview/autofix-per-model'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AutofixAnalyticsController.prototype, "getPerModel", null);
exports.AutofixAnalyticsController = AutofixAnalyticsController = __decorate([
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseInterceptors)(user_cache_interceptor_1.UserCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.DASHBOARD_CACHE_TTL_MS),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [analytics_scope_service_1.AnalyticsScopeService,
        autofix_stats_service_2.AutofixStatsService, Object])
], AutofixAnalyticsController);
//# sourceMappingURL=autofix-analytics.controller.js.map