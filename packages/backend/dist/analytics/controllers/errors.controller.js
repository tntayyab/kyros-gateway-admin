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
exports.ErrorsController = void 0;
const analytics_scope_service_1 = require("../services/analytics-scope.service");
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const range_query_dto_1 = require("../../common/dto/range-query.dto");
const error_breakdown_service_1 = require("../services/error-breakdown.service");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const user_cache_interceptor_1 = require("../../common/interceptors/user-cache.interceptor");
const cache_constants_1 = require("../../common/constants/cache.constants");
let ErrorsController = class ErrorsController {
    analyticsScope;
    errorBreakdown;
    constructor(analyticsScope, errorBreakdown) {
        this.analyticsScope = analyticsScope;
        this.errorBreakdown = errorBreakdown;
    }
    async getBreakdown(query, ctx) {
        return this.errorBreakdown.getBreakdown({
            tenantId: ctx.tenantId,
            range: query.range,
            agentScope: await this.analyticsScope.resolve(ctx.tenantId, query.agent_name),
        });
    }
};
exports.ErrorsController = ErrorsController;
__decorate([
    (0, common_1.Get)('errors/breakdown'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ErrorsController.prototype, "getBreakdown", null);
exports.ErrorsController = ErrorsController = __decorate([
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseInterceptors)(user_cache_interceptor_1.UserCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.DASHBOARD_CACHE_TTL_MS),
    __metadata("design:paramtypes", [analytics_scope_service_1.AnalyticsScopeService,
        error_breakdown_service_1.ErrorBreakdownService])
], ErrorsController);
//# sourceMappingURL=errors.controller.js.map