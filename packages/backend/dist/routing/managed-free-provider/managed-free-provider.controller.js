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
exports.ManagedFreeProviderController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const tenant_cache_service_1 = require("../../common/services/tenant-cache.service");
const managed_free_provider_service_1 = require("./managed-free-provider.service");
class EnsureManagedFreeProviderBody {
    apiKey;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], EnsureManagedFreeProviderBody.prototype, "apiKey", void 0);
let ManagedFreeProviderController = class ManagedFreeProviderController {
    managedFreeProvider;
    tenantCache;
    constructor(managedFreeProvider, tenantCache) {
        this.managedFreeProvider = managedFreeProvider;
        this.tenantCache = tenantCache;
    }
    async ensure(providerId, ctx, user, body) {
        const tenantId = ctx.tenantId ?? (user.id ? await this.tenantCache.ensureForUser(user.id) : null);
        if (!tenantId) {
            return {
                connected: false,
                connection_id: null,
                source: 'none',
                auto_available: false,
            };
        }
        return this.managedFreeProvider.ensureConnection(providerId, {
            tenantId,
            userId: ctx.userId ?? user.id ?? null,
            userEmail: user.email ?? null,
            apiKey: body?.apiKey,
        });
    }
};
exports.ManagedFreeProviderController = ManagedFreeProviderController;
__decorate([
    (0, common_1.Post)(':providerId/ensure'),
    __param(0, (0, common_1.Param)('providerId')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, EnsureManagedFreeProviderBody]),
    __metadata("design:returntype", Promise)
], ManagedFreeProviderController.prototype, "ensure", null);
exports.ManagedFreeProviderController = ManagedFreeProviderController = __decorate([
    (0, common_1.Controller)('api/v1/providers'),
    __metadata("design:paramtypes", [managed_free_provider_service_1.ManagedFreeProviderService,
        tenant_cache_service_1.TenantCacheService])
], ManagedFreeProviderController);
//# sourceMappingURL=managed-free-provider.controller.js.map