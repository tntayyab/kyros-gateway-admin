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
var ModelPricingCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPricingCacheService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const model_name_normalizer_1 = require("./model-name-normalizer");
const pricing_sync_service_1 = require("../database/pricing-sync.service");
const models_dev_sync_service_1 = require("../database/models-dev-sync.service");
const providers_1 = require("../common/constants/providers");
const manifest_shared_1 = require("manifest-shared");
const provider_model_registry_service_1 = require("../model-discovery/provider-model-registry.service");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const CUSTOM_PROVIDER_LABEL = 'Custom';
let ModelPricingCacheService = class ModelPricingCacheService {
    static { ModelPricingCacheService_1 = this; }
    pricingSync;
    modelsDevSync;
    modelRegistry;
    customProviderRepo;
    logger = new common_1.Logger(ModelPricingCacheService_1.name);
    cache = new Map();
    providerScoped = new Map();
    aliasMap = new Map();
    static scopedKey(providerId, modelName) {
        return `${providerId}::${modelName}`;
    }
    static PROVIDER_BY_DISPLAY_NAME = (() => {
        const index = new Map();
        for (const [id, entry] of providers_1.PROVIDER_BY_ID) {
            const lower = entry.displayName.toLowerCase();
            for (const key of [lower, (0, manifest_shared_1.normalizeProviderName)(lower)]) {
                if (!index.has(key))
                    index.set(key, id);
            }
        }
        return index;
    })();
    static resolveProviderId(provider) {
        const lower = provider.trim().toLowerCase();
        const normalized = (0, manifest_shared_1.normalizeProviderName)(lower);
        return (providers_1.PROVIDER_BY_ID_OR_ALIAS.get(lower)?.id ??
            providers_1.PROVIDER_BY_ID_OR_ALIAS.get(normalized)?.id ??
            ModelPricingCacheService_1.PROVIDER_BY_DISPLAY_NAME.get(lower) ??
            ModelPricingCacheService_1.PROVIDER_BY_DISPLAY_NAME.get(normalized));
    }
    constructor(pricingSync, modelsDevSync, modelRegistry, customProviderRepo = null) {
        this.pricingSync = pricingSync;
        this.modelsDevSync = modelsDevSync;
        this.modelRegistry = modelRegistry;
        this.customProviderRepo = customProviderRepo;
    }
    onApplicationBootstrap() {
        void this.warmup();
    }
    async warmup() {
        try {
            await Promise.allSettled([
                this.pricingSync.whenInitialized(),
                this.modelsDevSync?.whenInitialized() ?? Promise.resolve(),
            ]);
            await this.reload();
        }
        catch (err) {
            this.logger.error(`Pricing cache warmup failed: ${err}`);
        }
    }
    async scheduledReload() {
        await this.reload();
    }
    async reload() {
        this.cache.clear();
        this.providerScoped.clear();
        const orCache = this.pricingSync.getAll();
        for (const [fullId, entry] of orCache) {
            const { provider, canonical, providerId } = this.resolveProviderAndName(fullId);
            const pricingEntry = {
                model_name: fullId,
                provider,
                input_price_per_token: entry.input,
                output_price_per_token: entry.output,
                display_name: entry.displayName ?? null,
                validated: this.resolveValidated(providerId, canonical),
                source: 'openrouter',
            };
            this.cache.set(fullId, pricingEntry);
            this.providerScoped.set(ModelPricingCacheService_1.scopedKey('openrouter', fullId), pricingEntry);
            const bareKey = ModelPricingCacheService_1.scopedKey('openrouter', canonical);
            if (canonical !== fullId && !this.providerScoped.has(bareKey)) {
                this.providerScoped.set(bareKey, pricingEntry);
            }
            if (canonical !== fullId && !this.cache.has(canonical)) {
                this.cache.set(canonical, pricingEntry);
            }
        }
        this.loadModelsDevEntries();
        await this.loadCustomProviderEntries();
        this.aliasMap = (0, model_name_normalizer_1.buildAliasMap)([...this.cache.keys()]);
        this.logger.log(`Loaded ${this.cache.size} pricing entries`);
    }
    getByModel(modelName, provider) {
        if (provider) {
            const scoped = this.getProviderScoped(modelName, provider);
            if (scoped)
                return scoped;
            this.logger.debug(`No ${provider} price for ${modelName}; falling back to the shared catalogue entry`);
        }
        const exact = this.cache.get(modelName);
        if (exact)
            return exact;
        const resolved = (0, model_name_normalizer_1.resolveModelName)(modelName, this.aliasMap);
        if (resolved)
            return this.cache.get(resolved);
        return undefined;
    }
    getProviderScoped(modelName, provider) {
        const providerId = ModelPricingCacheService_1.resolveProviderId(provider);
        if (!providerId)
            return undefined;
        const bare = (0, model_name_normalizer_1.stripProviderPrefix)(modelName);
        const candidates = [
            modelName,
            bare,
            (0, model_name_normalizer_1.resolveModelName)(modelName, this.aliasMap),
            (0, model_name_normalizer_1.resolveModelName)(bare, this.aliasMap),
        ];
        for (const candidate of candidates) {
            if (!candidate)
                continue;
            const hit = this.providerScoped.get(ModelPricingCacheService_1.scopedKey(providerId, candidate));
            if (hit)
                return hit;
        }
        return undefined;
    }
    getAll() {
        const seen = new Set();
        const result = [];
        for (const entry of this.cache.values()) {
            if (entry.source === 'custom')
                continue;
            if (!seen.has(entry.model_name)) {
                seen.add(entry.model_name);
                result.push(entry);
            }
        }
        return result;
    }
    resolveProviderAndName(openRouterId) {
        if (openRouterId.startsWith('openrouter/')) {
            return { provider: 'OpenRouter', canonical: openRouterId, providerId: null };
        }
        const slashIdx = openRouterId.indexOf('/');
        if (slashIdx <= 0) {
            return { provider: 'OpenRouter', canonical: openRouterId, providerId: null };
        }
        const prefix = openRouterId.substring(0, slashIdx);
        const providerDisplayName = providers_1.OPENROUTER_PREFIX_TO_PROVIDER.get(prefix);
        if (providerDisplayName) {
            return {
                provider: providerDisplayName,
                canonical: openRouterId.substring(slashIdx + 1),
                providerId: prefix,
            };
        }
        return { provider: 'OpenRouter', canonical: openRouterId, providerId: null };
    }
    loadModelsDevEntries() {
        if (!this.modelsDevSync)
            return;
        let count = 0;
        for (const [providerId, registryEntry] of providers_1.PROVIDER_BY_ID) {
            const models = this.modelsDevSync.getModelsForProvider(providerId);
            for (const model of models) {
                if (model.inputPricePerToken === null)
                    continue;
                const pricingEntry = {
                    model_name: model.id,
                    provider: registryEntry.displayName,
                    input_price_per_token: model.inputPricePerToken,
                    output_price_per_token: model.outputPricePerToken,
                    cache_read_price_per_token: model.cacheReadPricePerToken ?? null,
                    cache_write_price_per_token: model.cacheWritePricePerToken ?? null,
                    time_tiers: model.timeTiers?.map((tier) => ({
                        windows: tier.windows,
                        days: tier.days ?? null,
                        input_price_per_token: tier.inputPricePerToken,
                        output_price_per_token: tier.outputPricePerToken,
                        cache_read_price_per_token: tier.cacheReadPricePerToken,
                        cache_write_price_per_token: tier.cacheWritePricePerToken,
                    })),
                    display_name: model.name || null,
                    validated: this.resolveValidatedForModelsDev(providerId, model.id),
                    source: 'models.dev',
                };
                this.providerScoped.set(ModelPricingCacheService_1.scopedKey(providerId, model.id), pricingEntry);
                const existing = this.cache.get(model.id);
                const hasRealPricing = existing && (existing.input_price_per_token ?? 0) > 0;
                const isZeroPricing = (model.inputPricePerToken ?? 0) === 0 && (model.outputPricePerToken ?? 0) === 0;
                if (!hasRealPricing || !isZeroPricing) {
                    this.cache.set(model.id, pricingEntry);
                }
                for (const prefix of registryEntry.openRouterPrefixes) {
                    const prefixedKey = `${prefix}/${model.id}`;
                    const orEntry = this.cache.get(prefixedKey);
                    if (orEntry) {
                        this.cache.set(prefixedKey, { ...orEntry, time_tiers: null });
                    }
                }
                count++;
            }
        }
        if (count > 0) {
            this.logger.log(`Overlaid ${count} models.dev pricing entries`);
        }
    }
    async loadCustomProviderEntries() {
        if (!this.customProviderRepo)
            return;
        let rows;
        try {
            rows = await this.customProviderRepo.find();
        }
        catch (err) {
            this.logger.warn(`Failed to load custom provider pricing: ${err.message}`);
            return;
        }
        let count = 0;
        for (const cp of rows) {
            if (!Array.isArray(cp.models))
                continue;
            for (const model of cp.models) {
                if (!model.model_name)
                    continue;
                const inputPerToken = model.input_price_per_million_tokens != null
                    ? model.input_price_per_million_tokens / 1_000_000
                    : null;
                const outputPerToken = model.output_price_per_million_tokens != null
                    ? model.output_price_per_million_tokens / 1_000_000
                    : null;
                if (inputPerToken === null && outputPerToken === null)
                    continue;
                const key = `custom:${cp.id}/${model.model_name}`;
                this.cache.set(key, {
                    model_name: key,
                    provider: CUSTOM_PROVIDER_LABEL,
                    input_price_per_token: inputPerToken,
                    output_price_per_token: outputPerToken,
                    display_name: model.model_name,
                    source: 'custom',
                });
                count++;
            }
        }
        if (count > 0) {
            this.logger.log(`Loaded ${count} custom provider pricing entries`);
        }
    }
    resolveValidated(providerId, canonical) {
        if (!this.modelRegistry || !providerId)
            return undefined;
        const entry = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(providerId);
        const canonicalProviderId = entry?.id ?? providerId;
        const result = this.modelRegistry.isModelConfirmed(canonicalProviderId, canonical);
        return result ?? undefined;
    }
    resolveValidatedForModelsDev(providerId, modelId) {
        if (!this.modelRegistry)
            return undefined;
        const result = this.modelRegistry.isModelConfirmed(providerId, modelId);
        return result ?? undefined;
    }
};
exports.ModelPricingCacheService = ModelPricingCacheService;
__decorate([
    (0, schedule_1.Cron)('0 5 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelPricingCacheService.prototype, "scheduledReload", null);
exports.ModelPricingCacheService = ModelPricingCacheService = ModelPricingCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)(models_dev_sync_service_1.ModelsDevSyncService)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)(provider_model_registry_service_1.ProviderModelRegistryService)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, typeorm_1.InjectRepository)(custom_provider_entity_1.CustomProvider)),
    __metadata("design:paramtypes", [pricing_sync_service_1.PricingSyncService, Object, Object, Object])
], ModelPricingCacheService);
//# sourceMappingURL=model-pricing-cache.service.js.map