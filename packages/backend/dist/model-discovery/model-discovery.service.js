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
var ModelDiscoveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const provider_model_fetcher_service_1 = require("./provider-model-fetcher.service");
const provider_model_registry_service_1 = require("./provider-model-registry.service");
const model_fetcher_1 = require("./model-fetcher");
const crypto_util_1 = require("../common/utils/crypto.util");
const quality_score_util_1 = require("../database/quality-score.util");
const pricing_sync_service_1 = require("../database/pricing-sync.service");
const models_dev_sync_service_1 = require("../database/models-dev-sync.service");
const core_1 = require("../routing/oauth/core");
const qwen_region_1 = require("../routing/qwen-region");
const bedrock_region_1 = require("../routing/bedrock-region");
const minimax_oauth_helpers_1 = require("../routing/oauth/minimax/minimax-oauth-helpers");
const xiaomi_region_1 = require("../routing/xiaomi-region");
const zai_region_1 = require("../routing/zai-region");
const copilot_token_service_1 = require("../routing/proxy/copilot-token.service");
const model_fallback_1 = require("./model-fallback");
const metadata_identity_1 = require("./metadata-identity");
const known_model_prices_1 = require("./known-model-prices");
const known_model_modalities_1 = require("./known-model-modalities");
const model_capabilities_1 = require("./model-capabilities");
const provider_availability_1 = require("../common/utils/provider-availability");
const customProviderKey = (id) => `custom:${id}`;
const customModelKey = (id, modelName) => `custom:${id}/${modelName}`;
function isQwenProvider(providerId) {
    const lower = providerId.toLowerCase();
    return lower === 'qwen' || lower === 'alibaba';
}
function modelsDevModelIdPrefix(providerId) {
    const lower = providerId.toLowerCase();
    return lower === 'opencode-go' || lower === 'opencode-zen' ? lower : undefined;
}
function prefersModelsDevCatalog(providerId) {
    const lower = providerId.toLowerCase();
    return lower === 'opencode-zen';
}
function nonChatFilterKey(providerId, authType) {
    const normalizedProvider = providerId.toLowerCase();
    if (authType !== 'subscription')
        return normalizedProvider;
    const subscriptionKey = `${normalizedProvider}-subscription`;
    if (provider_model_fetcher_service_1.PROVIDER_NON_CHAT[subscriptionKey] || provider_model_fetcher_service_1.PROVIDER_BLOCKLIST[subscriptionKey]) {
        return subscriptionKey;
    }
    return normalizedProvider;
}
const MODELS_CACHE_TTL_MS = 120_000;
let ModelDiscoveryService = ModelDiscoveryService_1 = class ModelDiscoveryService {
    providerRepo;
    customProviderRepo;
    fetcher;
    pricingSync;
    modelsDevSync;
    modelRegistry;
    copilotTokenService;
    enabledProviderRepo;
    logger = new common_1.Logger(ModelDiscoveryService_1.name);
    modelsCache = new Map();
    constructor(providerRepo, customProviderRepo, fetcher, pricingSync, modelsDevSync, modelRegistry, copilotTokenService, enabledProviderRepo = null) {
        this.providerRepo = providerRepo;
        this.customProviderRepo = customProviderRepo;
        this.fetcher = fetcher;
        this.pricingSync = pricingSync;
        this.modelsDevSync = modelsDevSync;
        this.modelRegistry = modelRegistry;
        this.copilotTokenService = copilotTokenService;
        this.enabledProviderRepo = enabledProviderRepo;
    }
    async discoverModels(provider, options = {}) {
        if (!(0, provider_availability_1.isProviderAvailableForDeployment)(provider.provider))
            return [];
        let apiKey = '';
        let endpointOverride;
        const lowerProvider = provider.provider.toLowerCase();
        if (provider.api_key_encrypted) {
            try {
                apiKey = (0, crypto_util_1.decryptWithAny)(provider.api_key_encrypted, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
            }
            catch {
                this.logger.warn(`Failed to decrypt key for provider ${provider.provider}`);
                return [];
            }
        }
        if (provider.auth_type === 'subscription' && apiKey) {
            if (lowerProvider === 'openai' ||
                lowerProvider === 'anthropic' ||
                lowerProvider === 'minimax' ||
                lowerProvider === 'kiro' ||
                lowerProvider === 'xai') {
                const blob = (0, core_1.parseOAuthTokenBlob)(apiKey);
                if (blob?.t) {
                    apiKey = blob.t;
                    if (lowerProvider === 'minimax' && blob.u) {
                        endpointOverride = blob.u;
                    }
                }
                if (lowerProvider === 'minimax' && !endpointOverride && provider.region === 'cn') {
                    endpointOverride = `${minimax_oauth_helpers_1.MINIMAX_BASE_URLS.cn}/anthropic/v1`;
                }
            }
            else if (lowerProvider === 'copilot' && this.copilotTokenService) {
                try {
                    apiKey = await this.copilotTokenService.getCopilotToken(apiKey);
                }
                catch {
                    this.logger.warn('Copilot token exchange failed for model discovery — falling back to known models');
                    apiKey = '';
                }
            }
        }
        if (lowerProvider === 'minimax' &&
            provider.auth_type === 'api_key' &&
            provider.region === 'cn') {
            endpointOverride = `${minimax_oauth_helpers_1.MINIMAX_BASE_URLS.cn}/v1`;
        }
        if (isQwenProvider(provider.provider) && (0, qwen_region_1.isQwenResolvedEndpoint)(provider.region)) {
            endpointOverride = (0, qwen_region_1.getQwenCompatibleBaseUrl)(provider.region);
        }
        if ((0, bedrock_region_1.isBedrockProvider)(provider.provider) && (0, bedrock_region_1.isBedrockRegion)(provider.region)) {
            endpointOverride = (0, bedrock_region_1.getBedrockMantleBaseUrl)(provider.region);
        }
        if (provider.provider.toLowerCase() === 'zai' &&
            provider.auth_type === 'subscription' &&
            provider.region === 'cn') {
            endpointOverride = (0, zai_region_1.getZaiCodingPlanBaseUrl)('cn');
        }
        if ((0, xiaomi_region_1.isXiaomiProviderId)(provider.provider) &&
            provider.auth_type === 'subscription' &&
            (0, xiaomi_region_1.isXiaomiTokenPlanRegion)(provider.region)) {
            endpointOverride = (0, xiaomi_region_1.getXiaomiTokenPlanBaseUrl)(provider.region);
        }
        if (options.forceRefresh && !options.skipModelsDevRefresh) {
            await this.refreshModelsDevCache();
        }
        let raw;
        const useCuratedSubscriptionModels = provider.auth_type === 'subscription' && (!apiKey || lowerProvider === 'anthropic');
        const fetchOptions = {
            ...(options.forceRefresh ? { forceRefresh: true } : {}),
            ...((0, bedrock_region_1.isBedrockProvider)(provider.provider)
                ? { previousModels: provider.cached_models ?? [] }
                : {}),
        };
        const fetchProviderModels = () => this.fetcher.fetch(provider.provider, apiKey, provider.auth_type, endpointOverride, fetchOptions);
        const buildModelsDevModels = () => {
            const models = (0, model_fallback_1.buildModelsDevFallback)(this.modelsDevSync, provider.provider, {
                idPrefix: modelsDevModelIdPrefix(provider.provider),
            });
            if (lowerProvider !== 'opencode-go')
                return models;
            return models.map((model) => ({
                ...model,
                inputPricePerToken: 0,
                outputPricePerToken: 0,
            }));
        };
        if (useCuratedSubscriptionModels) {
            raw = (0, model_fallback_1.buildSubscriptionFallbackModels)(provider.provider);
            if (raw.length > 0) {
                this.logger.log(`Subscription provider ${provider.provider} — using ${raw.length} curated models`);
            }
        }
        else if (provider.auth_type !== 'subscription' &&
            prefersModelsDevCatalog(provider.provider)) {
            raw = buildModelsDevModels();
            if (raw.length > 0) {
                this.logger.log(`Using ${raw.length} models from models.dev for ${provider.provider}`);
            }
            else {
                raw = await fetchProviderModels();
            }
        }
        else {
            raw = await fetchProviderModels();
            if (raw.length > 0 && this.modelRegistry) {
                this.modelRegistry.registerModels(provider.provider, raw);
            }
            if (raw.length === 0 && provider.auth_type === 'subscription') {
                raw = (0, model_fallback_1.buildSubscriptionFallbackModels)(provider.provider);
                if (raw.length > 0) {
                    this.logger.log(`Subscription provider ${provider.provider} — using ${raw.length} curated models`);
                }
            }
            if (raw.length === 0 && provider.auth_type !== 'subscription') {
                raw = buildModelsDevModels();
                if (raw.length > 0) {
                    this.logger.log(`Native API returned 0 models for ${provider.provider} — using ${raw.length} models from models.dev`);
                }
            }
            if (raw.length === 0 &&
                provider.auth_type !== 'subscription' &&
                !isQwenProvider(provider.provider)) {
                const confirmed = this.modelRegistry?.getConfirmedModels(provider.provider) ?? null;
                raw = (0, model_fallback_1.buildFallbackModels)(this.pricingSync, provider.provider, confirmed);
                if (raw.length > 0) {
                    this.logger.log(`No models.dev data for ${provider.provider} — using ${raw.length} models from OpenRouter`);
                }
            }
        }
        if (provider.auth_type === 'subscription') {
            raw = (0, model_fallback_1.supplementWithKnownModels)(raw, provider.provider);
        }
        const authType = provider.auth_type;
        const enriched = raw.map((model) => ({
            ...this.enrichModel(model, provider.provider),
            authType,
        }));
        const reconciled = provider.auth_type === 'subscription'
            ? enriched.map((model) => {
                const current = (0, model_fallback_1.reconcileCachedSubscriptionContextWindow)(model, provider.provider);
                return current === model ? model : this.computeScore(current);
            })
            : enriched;
        const filtered = reconciled.filter((model) => carriesText(model.inputModalities) && carriesText(model.outputModalities));
        const previousCachedCount = Array.isArray(provider.cached_models)
            ? provider.cached_models.length
            : 0;
        if (filtered.length === 0 && previousCachedCount > 0) {
            this.logger.warn(`Discovery returned 0 models for ${provider.provider} (tenant ${provider.tenant_id}); kept ${previousCachedCount} cached models`);
            return provider.cached_models ?? [];
        }
        provider.cached_models = filtered;
        provider.models_fetched_at = new Date().toISOString();
        await this.providerRepo.save(provider);
        await this.invalidateProviderAccess(provider);
        this.logger.log(`Discovered ${filtered.length} models for provider ${provider.provider} (tenant ${provider.tenant_id})`);
        return filtered;
    }
    async discoverAllForAgent(tenantId, options = {}) {
        if (options.forceRefresh) {
            await this.refreshModelsDevCache();
        }
        const discoveryOptions = options.forceRefresh
            ? { ...options, skipModelsDevRefresh: true }
            : options;
        const providers = (0, provider_availability_1.filterProvidersForDeployment)(await this.providerRepo.find({
            where: { tenant_id: tenantId, is_active: true },
        }));
        await Promise.all(providers
            .filter((p) => !p.provider.startsWith('custom:'))
            .map((p) => this.discoverModels(p, discoveryOptions).catch((err) => {
            this.logger.warn(`Discovery failed for ${p.provider}: ${err}`);
        })));
    }
    async refreshModelsDevCache() {
        if (!this.modelsDevSync)
            return;
        try {
            await this.modelsDevSync.refreshCache();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`models.dev refresh failed during manual model discovery: ${message}`);
        }
    }
    async refreshProvider(tenantId, providerId, authType) {
        if (!(0, provider_availability_1.isProviderAvailableForDeployment)(providerId)) {
            return {
                ok: false,
                model_count: 0,
                last_fetched_at: null,
                error: provider_availability_1.CLOUD_LOCAL_PROVIDER_MESSAGE,
            };
        }
        const where = {
            tenant_id: tenantId,
            provider: providerId,
            is_active: true,
        };
        if (authType)
            where.auth_type = authType;
        const providers = await this.providerRepo.find({ where });
        if (providers.length === 0) {
            return { ok: false, model_count: 0, last_fetched_at: null, error: 'Provider not found' };
        }
        if (providers[0].provider.startsWith('custom:')) {
            const custom = await this.customProviderRepo.findOne({
                where: { id: providers[0].provider.slice('custom:'.length), tenant_id: tenantId },
            });
            const modelCount = Array.isArray(custom?.models) ? custom.models.length : 0;
            const previousFetchedAt = providers
                .map((provider) => provider.models_fetched_at)
                .filter((value) => value !== null)
                .sort()
                .pop();
            return {
                ok: false,
                model_count: modelCount,
                last_fetched_at: previousFetchedAt ?? null,
                error: 'Custom providers are managed manually — edit the provider to update its model list',
            };
        }
        await this.refreshModelsDevCache();
        const results = await Promise.all(providers.map(async (provider) => {
            const previousCount = Array.isArray(provider.cached_models)
                ? provider.cached_models.length
                : 0;
            const previousFetchedAt = provider.models_fetched_at;
            try {
                const models = await this.discoverModels(provider, {
                    forceRefresh: true,
                    skipModelsDevRefresh: true,
                });
                return {
                    ok: models.length > 0,
                    modelCount: models.length,
                    lastFetchedAt: provider.models_fetched_at,
                    error: models.length === 0 ? 'Provider returned no models' : null,
                };
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                this.logger.warn(`Per-provider refresh failed for ${provider.provider} (tenant ${tenantId}): ${message}`);
                return {
                    ok: false,
                    modelCount: previousCount,
                    lastFetchedAt: previousFetchedAt,
                    error: message,
                };
            }
        }));
        const failed = results.find((result) => !result.ok);
        const lastFetchedAt = results
            .map((result) => result.lastFetchedAt)
            .filter((value) => value !== null)
            .sort()
            .pop();
        return {
            ok: failed === undefined,
            model_count: Math.max(...results.map((result) => result.modelCount)),
            last_fetched_at: lastFetchedAt ?? null,
            error: failed?.error ?? null,
        };
    }
    async getModelsForAgent(tenantId, agentId) {
        if (!agentId)
            return this.fetchModelsForAgent(tenantId);
        const cached = this.modelsCache.get(agentId);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
        if (cached)
            this.modelsCache.delete(agentId);
        const models = await this.fetchModelsForAgent(tenantId, agentId);
        const now = Date.now();
        for (const [key, entry] of this.modelsCache) {
            if (entry.expiresAt <= now)
                this.modelsCache.delete(key);
        }
        this.modelsCache.set(agentId, {
            tenantId,
            data: models,
            expiresAt: now + MODELS_CACHE_TTL_MS,
        });
        return models;
    }
    invalidate(agentId) {
        this.modelsCache.delete(agentId);
    }
    invalidateTenant(tenantId) {
        for (const [agentId, entry] of this.modelsCache) {
            if (entry.tenantId === tenantId)
                this.modelsCache.delete(agentId);
        }
    }
    async invalidateProviderAccess(provider) {
        if (provider.agent_id)
            this.invalidate(provider.agent_id);
        if (!this.enabledProviderRepo)
            return;
        const rows = await this.enabledProviderRepo.find({
            where: { tenant_provider_id: provider.id },
        });
        for (const row of rows) {
            this.invalidate(row.agent_id);
        }
    }
    async fetchModelsForAgent(tenantId, agentId) {
        const allProviders = (0, provider_availability_1.filterProvidersForDeployment)(await this.providerRepo.find({
            where: { tenant_id: tenantId, is_active: true },
        }));
        const providers = await this.filterProvidersForAgent(allProviders, agentId);
        const models = [];
        const seen = new Map();
        for (const p of providers) {
            if (p.provider.startsWith('custom:'))
                continue;
            const rawCached = p.cached_models;
            if (!Array.isArray(rawCached))
                continue;
            const providerAuthType = p.auth_type;
            const providerId = p.provider.toLowerCase();
            const filterKey = nonChatFilterKey(providerId, providerAuthType);
            const cached = (0, provider_model_fetcher_service_1.filterNonChatModels)(rawCached, filterKey);
            for (const cachedModel of cached) {
                const m = providerAuthType === 'subscription'
                    ? (0, model_fallback_1.reconcileCachedSubscriptionContextWindow)(cachedModel, p.provider)
                    : cachedModel;
                const effectiveAuthType = m.authType ?? providerAuthType;
                const dedupeKey = `${providerId}::${effectiveAuthType}::${m.id}`;
                if (!seen.has(dedupeKey)) {
                    seen.set(dedupeKey, models.length);
                    models.push({ ...m, provider: p.provider, authType: effectiveAuthType });
                }
            }
        }
        const customAuthTypes = new Map();
        for (const p of providers) {
            if (p.provider.startsWith('custom:')) {
                customAuthTypes.set(p.provider, p.auth_type);
            }
        }
        const customProviders = await this.customProviderRepo.find({
            where: { tenant_id: tenantId },
        });
        for (const cp of customProviders) {
            if (!Array.isArray(cp.models))
                continue;
            const cpKey = customProviderKey(cp.id);
            if (agentId && !customAuthTypes.has(cpKey))
                continue;
            for (const m of cp.models) {
                const modelKey = customModelKey(cp.id, m.model_name);
                if (seen.has(modelKey))
                    continue;
                seen.set(modelKey, models.length);
                const inputPerToken = m.input_price_per_million_tokens != null
                    ? m.input_price_per_million_tokens / 1_000_000
                    : null;
                const outputPerToken = m.output_price_per_million_tokens != null
                    ? m.output_price_per_million_tokens / 1_000_000
                    : null;
                models.push({
                    id: modelKey,
                    displayName: m.model_name,
                    provider: cpKey,
                    authType: customAuthTypes.get(cpKey) ?? 'api_key',
                    contextWindow: m.context_window ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
                    inputPricePerToken: inputPerToken,
                    outputPricePerToken: outputPerToken,
                    capabilityReasoning: false,
                    capabilityCode: false,
                    qualityScore: 2,
                    providerName: cp.name,
                    ...(cp.alias ? { providerAlias: cp.alias } : {}),
                });
            }
        }
        return models;
    }
    async filterProvidersForAgent(providers, agentId) {
        if (!agentId || !this.enabledProviderRepo)
            return providers;
        const rows = await this.enabledProviderRepo.find({ where: { agent_id: agentId } });
        if (rows.length === 0)
            return [];
        const enabledIds = new Set(rows.map((r) => r.tenant_provider_id));
        return providers.filter((p) => enabledIds.has(p.id));
    }
    async getModelForAgent(tenantId, modelName, agentId) {
        const all = await this.getModelsForAgent(tenantId, agentId);
        const matches = all.filter((m) => m.id === modelName);
        return matches.length === 1 ? matches[0] : undefined;
    }
    enrichModel(model, providerId) {
        const known = (0, known_model_modalities_1.lookupKnownModalities)(providerId, model.id);
        if (!known)
            return this.enrichFromCatalogs(model, providerId);
        const enriched = this.enrichFromCatalogs({ ...model, capabilities: (0, model_capabilities_1.mergeModelCapabilities)(model.capabilities, known.capabilities) }, providerId);
        return {
            ...enriched,
            inputModalities: enriched.inputModalities ?? known.input,
            outputModalities: enriched.outputModalities ?? known.output,
        };
    }
    enrichFromCatalogs(model, providerId) {
        if (model.inputPricePerToken !== null &&
            model.inputPricePerToken >= 0 &&
            model.outputPricePerToken !== null &&
            model.outputPricePerToken >= 0) {
            return this.computeScore(this.applyCapabilities(model, providerId));
        }
        const { metadata, entry: metadataEntry } = (0, metadata_identity_1.resolveMetadataEntry)(providerId, model.id, (lookupProvider, lookupModel) => this.modelsDevSync?.lookupModel(lookupProvider, lookupModel) ?? null);
        const metadataProvider = metadata.provider ?? providerId;
        const metadataModel = metadata.model;
        const isBedrock = providerId.toLowerCase() === 'bedrock';
        const modelWithMetadataName = metadataEntry?.name && metadataEntry.name !== model.id
            ? { ...model, displayName: metadataEntry.name }
            : model;
        const pricingProvider = isBedrock ? providerId : metadataProvider;
        const pricingModel = isBedrock ? model.id : metadataModel;
        const known = (0, known_model_prices_1.lookupKnownPrice)(pricingModel) ?? (0, known_model_prices_1.lookupKnownPrice)(model.id);
        if (known) {
            return this.computeScore(this.applyCapabilities({
                ...modelWithMetadataName,
                inputPricePerToken: known.input,
                outputPricePerToken: known.output,
            }, providerId));
        }
        if (this.modelsDevSync) {
            const mdEntry = pricingProvider === metadataProvider && pricingModel === metadataModel
                ? metadataEntry
                : this.modelsDevSync.lookupModel(pricingProvider, pricingModel);
            if (mdEntry && mdEntry.inputPricePerToken !== null) {
                const capabilityEntry = metadataEntry ?? mdEntry;
                return this.computeScore({
                    ...modelWithMetadataName,
                    inputPricePerToken: mdEntry.inputPricePerToken,
                    outputPricePerToken: mdEntry.outputPricePerToken,
                    contextWindow: mdEntry.contextWindow ?? capabilityEntry.contextWindow ?? model.contextWindow,
                    displayName: capabilityEntry.name || mdEntry.name || modelWithMetadataName.displayName,
                    capabilityReasoning: capabilityEntry.reasoning ?? model.capabilityReasoning,
                    capabilityCode: capabilityEntry.toolCall ?? model.capabilityCode,
                    ...providerModalitiesFirst(model, capabilityEntry),
                    capabilities: (0, model_capabilities_1.mergeModelCapabilities)(model.capabilities, capabilityEntry.capabilities, (0, model_capabilities_1.modelSupportsStreaming)(metadataProvider, metadataModel) ? ['stream'] : undefined),
                });
            }
        }
        let priced = modelWithMetadataName;
        if (this.pricingSync && !isBedrock) {
            const orPrefix = (0, model_fallback_1.findOpenRouterPrefix)(metadataProvider);
            const orPricing = orPrefix
                ? (0, model_fallback_1.lookupWithVariants)(this.pricingSync, orPrefix, metadataModel)
                : null;
            const pricing = orPricing ?? this.pricingSync.lookupPricing(model.id);
            if (pricing) {
                priced = {
                    ...modelWithMetadataName,
                    inputPricePerToken: pricing.input,
                    outputPricePerToken: pricing.output,
                    contextWindow: pricing.contextWindow ?? modelWithMetadataName.contextWindow,
                    displayName: pricing.displayName || modelWithMetadataName.displayName,
                };
            }
        }
        return this.computeScore(this.applyCapabilities(priced, providerId));
    }
    applyCapabilities(model, providerId) {
        if (!this.modelsDevSync)
            return model;
        const { metadata, entry: mdEntry } = (0, metadata_identity_1.resolveMetadataEntry)(providerId, model.id, (lookupProvider, lookupModel) => this.modelsDevSync.lookupModelCapabilities(lookupProvider, lookupModel));
        const metadataProvider = metadata.provider ?? providerId;
        if (!mdEntry)
            return model;
        return {
            ...model,
            capabilityReasoning: mdEntry.reasoning ?? model.capabilityReasoning,
            capabilityCode: mdEntry.toolCall ?? model.capabilityCode,
            ...providerModalitiesFirst(model, mdEntry),
            capabilities: (0, model_capabilities_1.mergeModelCapabilities)(model.capabilities, mdEntry.capabilities, (0, model_capabilities_1.modelSupportsStreaming)(metadataProvider, metadata.model) ? ['stream'] : undefined),
        };
    }
    computeScore(model) {
        const score = (0, quality_score_util_1.computeQualityScore)({
            model_name: model.id,
            input_price_per_token: model.inputPricePerToken,
            output_price_per_token: model.outputPricePerToken,
            capability_reasoning: model.capabilityReasoning,
            capability_code: model.capabilityCode,
            context_window: model.contextWindow,
        });
        return { ...model, qualityScore: score };
    }
};
exports.ModelDiscoveryService = ModelDiscoveryService;
exports.ModelDiscoveryService = ModelDiscoveryService = ModelDiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(1, (0, typeorm_1.InjectRepository)(custom_provider_entity_1.CustomProvider)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, common_1.Inject)(pricing_sync_service_1.PricingSyncService)),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)(models_dev_sync_service_1.ModelsDevSyncService)),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, common_1.Inject)(provider_model_registry_service_1.ProviderModelRegistryService)),
    __param(6, (0, common_1.Optional)()),
    __param(6, (0, common_1.Inject)(copilot_token_service_1.CopilotTokenService)),
    __param(7, (0, common_1.Optional)()),
    __param(7, (0, typeorm_1.InjectRepository)(agent_enabled_provider_entity_1.AgentEnabledProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        provider_model_fetcher_service_1.ProviderModelFetcherService, Object, Object, Object, Object, Object])
], ModelDiscoveryService);
function carriesText(modalities) {
    return !modalities || modalities.includes('text');
}
function providerModalitiesFirst(model, entry) {
    const inputModalities = model.inputModalities ?? entry.inputModalities;
    const outputModalities = model.outputModalities ?? entry.outputModalities;
    return {
        ...(inputModalities ? { inputModalities } : {}),
        ...(outputModalities ? { outputModalities } : {}),
    };
}
//# sourceMappingURL=model-discovery.service.js.map