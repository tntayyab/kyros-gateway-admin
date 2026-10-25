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
exports.ProviderUsageController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const user_cache_interceptor_1 = require("../../common/interceptors/user-cache.interceptor");
const cache_constants_1 = require("../../common/constants/cache.constants");
const provider_usage_service_1 = require("../services/provider-usage.service");
const provider_availability_1 = require("../../common/utils/provider-availability");
let ProviderUsageController = class ProviderUsageController {
    providerUsage;
    constructor(providerUsage) {
        this.providerUsage = providerUsage;
    }
    async getUsage(ctx) {
        const providers = await this.providerUsage.getUsage(ctx.tenantId);
        return { providers: (0, provider_availability_1.filterProvidersForDeployment)(providers) };
    }
};
exports.ProviderUsageController = ProviderUsageController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderUsageController.prototype, "getUsage", null);
exports.ProviderUsageController = ProviderUsageController = __decorate([
    (0, common_1.Controller)('api/v1/providers/usage'),
    (0, common_1.UseInterceptors)(user_cache_interceptor_1.UserCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.DASHBOARD_CACHE_TTL_MS),
    __metadata("design:paramtypes", [provider_usage_service_1.ProviderUsageService])
], ProviderUsageController);
//# sourceMappingURL=provider-usage.controller.js.map