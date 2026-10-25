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
exports.TenantProvidersController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const model_pricing_cache_service_1 = require("../model-prices/model-pricing-cache.service");
const custom_provider_service_1 = require("./custom-provider/custom-provider.service");
const provider_availability_1 = require("../common/utils/provider-availability");
const provider_service_1 = require("./routing-core/provider.service");
const routing_cache_service_1 = require("./routing-core/routing-cache.service");
const model_discovery_service_1 = require("../model-discovery/model-discovery.service");
const routing_dto_1 = require("./dto/routing.dto");
let TenantProvidersController = class TenantProvidersController {
    providerRepo;
    pricingCache;
    customProviderService;
    providerService;
    discoveryService;
    routingCache;
    cacheManager;
    constructor(providerRepo, pricingCache, customProviderService, providerService, discoveryService, routingCache, cacheManager) {
        this.providerRepo = providerRepo;
        this.pricingCache = pricingCache;
        this.customProviderService = customProviderService;
        this.providerService = providerService;
        this.discoveryService = discoveryService;
        this.routingCache = routingCache;
        this.cacheManager = cacheManager;
    }
    requireTenant(ctx) {
        if (!ctx.tenantId)
            throw new common_1.NotFoundException('Provider not found');
        return ctx.tenantId;
    }
    async invalidateTenantRouting(tenantId) {
        for (const agentId of await this.providerService.listOwnedAgentIds(tenantId)) {
            this.routingCache.invalidateAgent(agentId);
        }
        this.routingCache.invalidateTenant(tenantId);
    }
    async refreshModels(ctx) {
        const tenantId = this.requireTenant(ctx);
        await this.discoveryService.discoverAllForAgent(tenantId, { forceRefresh: true });
        await this.invalidateTenantRouting(tenantId);
        return { ok: true };
    }
    async renameProviderKey(ctx, params, body) {
        const tenantId = this.requireTenant(ctx);
        const updated = await this.providerService.renameKey(null, tenantId, params.provider, body.authType ?? 'api_key', params.label, body.newLabel);
        await this.invalidateTenantRouting(tenantId);
        return {
            id: updated.id,
            provider: updated.provider,
            auth_type: updated.auth_type,
            label: updated.label,
            priority: updated.priority,
        };
    }
    async removeProvider(ctx, params, query) {
        const tenantId = this.requireTenant(ctx);
        const { notifications } = await this.providerService.removeProvider(null, tenantId, params.provider, query.authType, query.label);
        await this.invalidateTenantRouting(tenantId);
        await this.cacheManager.clear();
        return { ok: true, notifications };
    }
    async listProviders(ctx) {
        const tenantId = ctx.tenantId;
        const providers = (0, provider_availability_1.filterProvidersForDeployment)(tenantId ? await this.providerRepo.find({ where: { tenant_id: tenantId } }) : []);
        const grouped = new Map();
        for (const p of providers) {
            const key = `${p.provider}::${p.auth_type}`;
            const existing = grouped.get(key);
            const modelCount = Array.isArray(p.cached_models) ? p.cached_models.length : 0;
            if (existing) {
                existing.connections.push({
                    id: p.id,
                    label: p.label,
                    key_prefix: p.key_prefix,
                    priority: p.priority,
                    connected_at: p.connected_at,
                    models_fetched_at: p.models_fetched_at,
                    cached_model_count: modelCount,
                    is_active: p.is_active,
                });
                existing.total_models = Math.max(existing.total_models, modelCount);
            }
            else {
                grouped.set(key, {
                    provider: p.provider,
                    auth_type: p.auth_type,
                    connections: [
                        {
                            id: p.id,
                            label: p.label,
                            key_prefix: p.key_prefix,
                            priority: p.priority,
                            connected_at: p.connected_at,
                            models_fetched_at: p.models_fetched_at,
                            cached_model_count: modelCount,
                            is_active: p.is_active,
                        },
                    ],
                    total_models: modelCount,
                });
            }
        }
        const customProviders = tenantId ? await this.customProviderService.list(tenantId) : [];
        const customNameById = new Map(customProviders.map((cp) => [cp.id, cp.name]));
        const result = Array.from(grouped.values()).map((g) => ({
            provider: g.provider,
            auth_type: g.auth_type,
            display_name: g.provider.startsWith('custom:')
                ? (customNameById.get(g.provider.slice('custom:'.length)) ?? null)
                : null,
            connection_count: g.connections.length,
            connections: g.connections,
            total_models: g.total_models,
        }));
        const allPricing = this.pricingCache.getAll();
        const modelCountByProvider = new Map();
        for (const entry of allPricing) {
            const prov = entry.provider?.toLowerCase();
            if (prov) {
                modelCountByProvider.set(prov, (modelCountByProvider.get(prov) ?? 0) + 1);
            }
        }
        return {
            providers: result,
            model_counts: Object.fromEntries(modelCountByProvider),
        };
    }
};
exports.TenantProvidersController = TenantProvidersController;
__decorate([
    (0, common_1.Post)('refresh-models'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantProvidersController.prototype, "refreshModels", null);
__decorate([
    (0, common_1.Patch)(':provider/keys/:label'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.ProviderKeyParamDto,
        routing_dto_1.RenameProviderKeyDto]),
    __metadata("design:returntype", Promise)
], TenantProvidersController.prototype, "renameProviderKey", null);
__decorate([
    (0, common_1.Delete)(':provider'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.ProviderParamDto,
        routing_dto_1.RemoveProviderQueryDto]),
    __metadata("design:returntype", Promise)
], TenantProvidersController.prototype, "removeProvider", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantProvidersController.prototype, "listProviders", null);
exports.TenantProvidersController = TenantProvidersController = __decorate([
    (0, common_1.Controller)('api/v1/providers'),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(6, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        model_pricing_cache_service_1.ModelPricingCacheService,
        custom_provider_service_1.CustomProviderService,
        provider_service_1.ProviderService,
        model_discovery_service_1.ModelDiscoveryService,
        routing_cache_service_1.RoutingCacheService, Object])
], TenantProvidersController);
//# sourceMappingURL=tenant-providers.controller.js.map