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
exports.ModelController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const resolve_agent_service_1 = require("./routing-core/resolve-agent.service");
const custom_provider_service_1 = require("./custom-provider/custom-provider.service");
const provider_param_spec_service_1 = require("./routing-core/provider-param-spec.service");
const model_discovery_service_1 = require("../model-discovery/model-discovery.service");
const opencode_go_catalog_service_1 = require("../model-discovery/opencode-go-catalog.service");
const ollama_sync_service_1 = require("../database/ollama-sync.service");
const pricing_sync_service_1 = require("../database/pricing-sync.service");
const models_dev_sync_service_1 = require("../database/models-dev-sync.service");
const routing_cache_service_1 = require("./routing-core/routing-cache.service");
const manifest_shared_1 = require("manifest-shared");
const model_capabilities_1 = require("../model-discovery/model-capabilities");
const published_gateway_models_1 = require("../model-discovery/published-gateway-models");
const routing_dto_1 = require("./dto/routing.dto");
const provider_availability_1 = require("../common/utils/provider-availability");
function formatModelSlug(slug) {
    return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function displayNameForModel(provider, modelId, displayName, metadataName) {
    const trimmedDisplay = displayName?.trim();
    if (trimmedDisplay && trimmedDisplay !== modelId)
        return trimmedDisplay;
    const trimmedMetadata = metadataName?.trim();
    if (trimmedMetadata && trimmedMetadata !== modelId)
        return trimmedMetadata;
    const metadata = (0, manifest_shared_1.resolveProviderMetadataIdentity)(provider, modelId);
    if (provider.toLowerCase() === 'bedrock' &&
        metadata.provider &&
        metadata.provider !== provider &&
        metadata.model !== modelId) {
        return formatModelSlug(metadata.model);
    }
    return trimmedDisplay || null;
}
let ModelController = class ModelController {
    discoveryService;
    ollamaSync;
    resolveAgentService;
    customProviderService;
    pricingSync;
    providerParamSpecs;
    modelsDevSync;
    opencodeGoCatalog;
    routingCache;
    constructor(discoveryService, ollamaSync, resolveAgentService, customProviderService, pricingSync, providerParamSpecs, modelsDevSync, opencodeGoCatalog, routingCache) {
        this.discoveryService = discoveryService;
        this.ollamaSync = ollamaSync;
        this.resolveAgentService = resolveAgentService;
        this.customProviderService = customProviderService;
        this.pricingSync = pricingSync;
        this.providerParamSpecs = providerParamSpecs;
        this.modelsDevSync = modelsDevSync;
        this.opencodeGoCatalog = opencodeGoCatalog;
        this.routingCache = routingCache;
    }
    pricingHealth() {
        return {
            model_count: this.pricingSync.getAll().size,
            last_fetched_at: this.pricingSync.getLastFetchedAt()?.toISOString() ?? null,
        };
    }
    async refreshPricing() {
        const modelCount = await this.pricingSync.refreshCache();
        return {
            ok: modelCount > 0,
            model_count: modelCount,
            last_fetched_at: this.pricingSync.getLastFetchedAt()?.toISOString() ?? null,
        };
    }
    async refreshModels(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        await this.discoveryService.discoverAllForAgent(agent.tenant_id, { forceRefresh: true });
        this.routingCache.invalidateAgent(agent.id);
        this.routingCache.invalidateTenant(agent.tenant_id);
        return { ok: true };
    }
    async refreshProviderModels(ctx, params, query) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const result = await this.discoveryService.refreshProvider(agent.tenant_id, params.provider, query.authType);
        this.routingCache.invalidateAgent(agent.id);
        this.routingCache.invalidateTenant(agent.tenant_id);
        return result;
    }
    async syncOllama() {
        if (!(0, provider_availability_1.isProviderAvailableForDeployment)('ollama')) {
            throw new common_1.BadRequestException(provider_availability_1.CLOUD_LOCAL_PROVIDER_MESSAGE);
        }
        return this.ollamaSync.sync();
    }
    async getAvailableModels(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName, {
            allowPlayground: true,
        });
        const models = await this.discoveryService.getModelsForAgent(agent.tenant_id, agent.id);
        const publishedGatewayIds = await (0, published_gateway_models_1.publishedOpencodeGoIds)(models, this.opencodeGoCatalog, this.modelsDevSync);
        const customProviders = await this.customProviderService.list(agent.tenant_id);
        const cpNameMap = new Map();
        for (const cp of customProviders) {
            cpNameMap.set(custom_provider_service_1.CustomProviderService.providerKey(cp.id), cp.name);
        }
        const rows = await Promise.all(models.map(async (m) => {
            const isCustom = custom_provider_service_1.CustomProviderService.isCustom(m.provider);
            const authType = m.authType ?? 'api_key';
            const { capabilities: modelCapabilities, inputModalities: knownInputModalities, modelsDevEntry, } = await (0, model_capabilities_1.resolveModelCapabilityMetadata)(m, this.providerParamSpecs, this.modelsDevSync);
            const inputModalities = knownInputModalities ?? (0, model_capabilities_1.inputModalitiesFromCapabilities)(modelCapabilities);
            const costPerRequest = m.provider === 'opencode-go'
                ? await this.opencodeGoCatalog.resolveCostPerRequest(m.id)
                : null;
            return {
                model_name: m.id,
                provider: m.provider,
                auth_type: authType,
                input_price_per_token: m.inputPricePerToken,
                output_price_per_token: m.outputPricePerToken,
                ...(costPerRequest != null ? { cost_per_request: costPerRequest } : {}),
                context_window: m.contextWindow,
                capability_reasoning: m.capabilityReasoning,
                capability_code: m.capabilityCode,
                ...(modelCapabilities ? { capabilities: modelCapabilities } : {}),
                input_modalities: inputModalities,
                output_modalities: ['text'],
                quality_score: m.qualityScore,
                display_name: isCustom
                    ? custom_provider_service_1.CustomProviderService.rawModelName(m.id)
                    : displayNameForModel(m.provider, m.id, m.displayName, modelsDevEntry?.name),
                ...(isCustom && {
                    provider_display_name: cpNameMap.get(m.provider) ?? m.provider,
                }),
            };
        }));
        return (0, published_gateway_models_1.dropShadowedGatewayModels)(rows, publishedGatewayIds);
    }
};
exports.ModelController = ModelController;
__decorate([
    (0, common_1.Get)('pricing-health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ModelController.prototype, "pricingHealth", null);
__decorate([
    (0, common_1.Post)('pricing/refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "refreshPricing", null);
__decorate([
    (0, common_1.Post)(':agentName/refresh-models'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "refreshModels", null);
__decorate([
    (0, common_1.Post)(':agentName/providers/:provider/refresh-models'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentProviderParamDto,
        routing_dto_1.RemoveProviderQueryDto]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "refreshProviderModels", null);
__decorate([
    (0, common_1.Post)('ollama/sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "syncOllama", null);
__decorate([
    (0, common_1.Get)(':agentName/available-models'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "getAvailableModels", null);
exports.ModelController = ModelController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [model_discovery_service_1.ModelDiscoveryService,
        ollama_sync_service_1.OllamaSyncService,
        resolve_agent_service_1.ResolveAgentService,
        custom_provider_service_1.CustomProviderService,
        pricing_sync_service_1.PricingSyncService,
        provider_param_spec_service_1.ProviderParamSpecService,
        models_dev_sync_service_1.ModelsDevSyncService,
        opencode_go_catalog_service_1.OpencodeGoCatalogService,
        routing_cache_service_1.RoutingCacheService])
], ModelController);
//# sourceMappingURL=model.controller.js.map