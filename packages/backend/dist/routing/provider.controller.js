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
exports.ProviderController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const provider_service_1 = require("./routing-core/provider.service");
const custom_provider_service_1 = require("./custom-provider/custom-provider.service");
const resolve_agent_service_1 = require("./routing-core/resolve-agent.service");
const tier_service_1 = require("./routing-core/tier.service");
const model_discovery_service_1 = require("../model-discovery/model-discovery.service");
const ollama_sync_service_1 = require("../database/ollama-sync.service");
const pricing_sync_service_1 = require("../database/pricing-sync.service");
const routing_dto_1 = require("./dto/routing.dto");
const qwen_region_1 = require("./qwen-region");
const subscription_region_1 = require("./subscription-region");
const bedrock_region_1 = require("./bedrock-region");
const minimax_oauth_helpers_1 = require("./oauth/minimax/minimax-oauth-helpers");
const provider_availability_1 = require("../common/utils/provider-availability");
let ProviderController = class ProviderController {
    providerService;
    discoveryService;
    ollamaSync;
    resolveAgentService;
    tierService;
    pricingSync;
    customProviderService;
    cacheManager;
    constructor(providerService, discoveryService, ollamaSync, resolveAgentService, tierService, pricingSync, customProviderService, cacheManager) {
        this.providerService = providerService;
        this.discoveryService = discoveryService;
        this.ollamaSync = ollamaSync;
        this.resolveAgentService = resolveAgentService;
        this.tierService = tierService;
        this.pricingSync = pricingSync;
        this.customProviderService = customProviderService;
        this.cacheManager = cacheManager;
    }
    async customConnectionLabel(tenantId, provider, body) {
        if ((body.authType ?? 'api_key') !== 'api_key') {
            throw new common_1.BadRequestException('Custom providers only take API key connections');
        }
        const id = provider.slice('custom:'.length);
        if (!(await this.customProviderService.getById(id, tenantId))) {
            throw new common_1.NotFoundException('Custom provider not found');
        }
        if (body.label)
            return body.label;
        return (await this.customProviderService.primaryConnection(tenantId, id))?.label;
    }
    async getStatus(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const providers = await this.providerService.getProviders(agent.tenant_id);
        const hasActiveProvider = providers.some((p) => p.is_active);
        if (!hasActiveProvider) {
            return { enabled: false, reason: 'no_provider' };
        }
        const hasRoutableTier = await this.tierService.hasRoutableTier(agent.id);
        if (!hasRoutableTier) {
            const pricingCacheEmpty = this.pricingSync.getAll().size === 0;
            return {
                enabled: false,
                reason: pricingCacheEmpty
                    ? 'pricing_cache_empty'
                    : 'no_routable_models',
            };
        }
        return { enabled: true, reason: null };
    }
    async getProviders(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName, {
            allowPlayground: true,
        });
        const providers = await this.providerService.getProviders(agent.tenant_id);
        return providers.map((p) => ({
            id: p.id,
            provider: p.provider,
            auth_type: p.auth_type ?? 'api_key',
            is_active: p.is_active,
            has_api_key: !!p.api_key_encrypted,
            key_prefix: p.key_prefix ?? null,
            label: p.label,
            priority: p.priority,
            region: p.region ?? null,
            connected_at: p.connected_at,
            models_fetched_at: p.models_fetched_at ?? null,
            cached_model_count: Array.isArray(p.cached_models) ? p.cached_models.length : 0,
        }));
    }
    async upsertProvider(ctx, params, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName, {
            allowPlayground: true,
        });
        const lowerProvider = body.provider.toLowerCase();
        const isCustomProvider = lowerProvider.startsWith('custom:');
        const label = isCustomProvider
            ? await this.customConnectionLabel(agent.tenant_id, lowerProvider, body)
            : body.label;
        if (!(0, provider_availability_1.isProviderAvailableForDeployment)(lowerProvider) ||
            (body.authType === 'local' && !(0, provider_availability_1.isProviderAvailableForDeployment)('ollama'))) {
            throw new common_1.BadRequestException(provider_availability_1.CLOUD_LOCAL_PROVIDER_MESSAGE);
        }
        const isQwenProvider = lowerProvider === 'qwen' || lowerProvider === 'alibaba';
        const isMinimaxApiKey = lowerProvider === 'minimax' && (body.authType ?? 'api_key') === 'api_key';
        const qwenBaseUrl = body.baseUrl ?? body.base_url;
        const qwenRegion = qwenBaseUrl ?? body.region;
        const subscriptionRegionConfig = (0, subscription_region_1.getSubscriptionEndpointRegionConfig)(lowerProvider, body.authType);
        if (qwenBaseUrl !== undefined && !isQwenProvider) {
            throw new common_1.BadRequestException('baseUrl is only supported for Alibaba/Qwen providers');
        }
        if (qwenBaseUrl !== undefined && body.region !== undefined) {
            throw new common_1.BadRequestException('Use either region or baseUrl for Alibaba/Qwen providers');
        }
        if (qwenRegion !== undefined || body.region !== undefined) {
            if (isQwenProvider) {
                if (!(0, qwen_region_1.isQwenRegion)(qwenRegion)) {
                    throw new common_1.BadRequestException(qwen_region_1.QWEN_REGION_VALIDATION_MESSAGE);
                }
            }
            else if ((0, bedrock_region_1.isBedrockProvider)(lowerProvider) && (body.authType ?? 'api_key') === 'api_key') {
                if (!(0, bedrock_region_1.isBedrockRegion)(body.region)) {
                    throw new common_1.BadRequestException('AWS Bedrock region must be a valid AWS region code');
                }
            }
            else if (subscriptionRegionConfig) {
                if (!subscriptionRegionConfig.isRegion(body.region)) {
                    throw new common_1.BadRequestException(subscriptionRegionConfig.validationMessage);
                }
            }
            else if (isMinimaxApiKey) {
                if (!(0, minimax_oauth_helpers_1.isMinimaxRegion)(body.region)) {
                    throw new common_1.BadRequestException(minimax_oauth_helpers_1.MINIMAX_API_KEY_REGION_VALIDATION_MESSAGE);
                }
            }
            else {
                throw new common_1.BadRequestException('region is only supported for Alibaba/Qwen providers, AWS Bedrock, MiniMax, Xiaomi MiMo Token Plan, and Z.ai subscriptions');
            }
        }
        if (body.provider.toLowerCase() === 'ollama') {
            await this.ollamaSync.sync();
        }
        const { provider: result } = await this.providerService.upsertProvider(agent.id, agent.tenant_id, body.provider, body.apiKey, body.authType, qwenRegion, label, ctx.userId);
        if (!isCustomProvider) {
            try {
                await this.discoveryService.discoverModels(result);
            }
            catch {
            }
        }
        return {
            id: result.id,
            provider: result.provider,
            auth_type: result.auth_type ?? 'api_key',
            is_active: result.is_active,
            label: result.label,
            priority: result.priority,
            region: result.region ?? null,
        };
    }
    async renameProviderKey(ctx, params, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const updated = await this.providerService.renameKey(agent.id, agent.tenant_id, params.provider, body.authType ?? 'api_key', params.label, body.newLabel);
        return {
            id: updated.id,
            provider: updated.provider,
            auth_type: updated.auth_type,
            label: updated.label,
            priority: updated.priority,
        };
    }
    async reorderProviderKeys(ctx, params, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const updated = await this.providerService.reorderKeys(agent.id, agent.tenant_id, params.provider, body.authType ?? 'api_key', body.labels);
        return updated
            .sort((a, b) => a.priority - b.priority)
            .map((row) => ({
            id: row.id,
            label: row.label,
            priority: row.priority,
        }));
    }
    async deactivateAllProviders(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        await this.providerService.deactivateAllProviders(agent.id, agent.tenant_id);
        return { ok: true };
    }
    async removeProvider(ctx, params, query) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const { notifications } = await this.providerService.removeProvider(agent.id, agent.tenant_id, params.provider, query.authType, query.label);
        await this.cacheManager.clear();
        return { ok: true, notifications };
    }
};
exports.ProviderController = ProviderController;
__decorate([
    (0, common_1.Get)(':agentName/status'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)(':agentName/providers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "getProviders", null);
__decorate([
    (0, common_1.Post)(':agentName/providers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto,
        routing_dto_1.ConnectProviderDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "upsertProvider", null);
__decorate([
    (0, common_1.Patch)(':agentName/providers/:provider/keys/:label'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentProviderKeyParamDto,
        routing_dto_1.RenameProviderKeyDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "renameProviderKey", null);
__decorate([
    (0, common_1.Put)(':agentName/providers/:provider/keys/order'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentProviderParamDto,
        routing_dto_1.ReorderProviderKeysDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "reorderProviderKeys", null);
__decorate([
    (0, common_1.Post)(':agentName/providers/deactivate-all'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "deactivateAllProviders", null);
__decorate([
    (0, common_1.Delete)(':agentName/providers/:provider'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentProviderParamDto,
        routing_dto_1.RemoveProviderQueryDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "removeProvider", null);
exports.ProviderController = ProviderController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __param(7, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        model_discovery_service_1.ModelDiscoveryService,
        ollama_sync_service_1.OllamaSyncService,
        resolve_agent_service_1.ResolveAgentService,
        tier_service_1.TierService,
        pricing_sync_service_1.PricingSyncService,
        custom_provider_service_1.CustomProviderService, Object])
], ProviderController);
//# sourceMappingURL=provider.controller.js.map