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
var ModelsDevSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelsDevSyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const manifest_shared_1 = require("manifest-shared");
const providers_1 = require("../common/constants/providers");
const model_capabilities_1 = require("../model-discovery/model-capabilities");
const model_name_normalizer_1 = require("../model-prices/model-name-normalizer");
const PROVIDER_ID_MAP = {
    anthropic: 'anthropic',
    cerebras: 'cerebras',
    openai: 'openai',
    gemini: 'google',
    vertex: 'google-vertex',
    deepseek: 'deepseek',
    fireworks: 'fireworks-ai',
    mistral: 'mistral',
    xai: 'xai',
    bedrock: 'amazon-bedrock',
    minimax: 'minimax',
    moonshot: 'moonshotai',
    nvidia: 'nvidia',
    qwen: 'alibaba',
    zai: 'zai',
    copilot: 'github-copilot',
    groq: 'groq',
    'opencode-go': 'opencode-go',
    'opencode-zen': 'opencode',
    'ollama-cloud': 'ollama-cloud',
};
const CAPABILITY_ONLY_PROVIDER_ID_MAP = {
    kilo: 'kilo',
    pioneer: 'pioneer',
    'cline-pass': 'cline-pass',
    xiaomi: 'xiaomi',
    openrouter: 'openrouter',
};
const SUPPORTED_PROVIDERS = new Set(Object.keys(PROVIDER_ID_MAP));
function resolveProviderId(providerId) {
    const lower = providerId.toLowerCase();
    if (SUPPORTED_PROVIDERS.has(lower))
        return lower;
    const entry = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(lower);
    return entry?.id ?? lower;
}
const MODELS_DEV_API = 'https://models.dev/api.json';
const FETCH_TIMEOUT_MS = 10000;
const TIME_WINDOW_RE = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;
const DEEPSEEK_PEAK_WINDOWS = ['01:00-04:00', '06:00-10:00'];
const DEEPSEEK_PEAK_DAYS = [1, 2, 3, 4, 5];
const DEEPSEEK_FLASH_RATES = {
    input: 0.15,
    output: 0.6,
    cacheRead: 0.003,
    peak: { input: 0.3, output: 1.2, cacheRead: 0.006 },
};
const DEEPSEEK_PRO_RATES = {
    input: 0.66,
    output: 1.98,
    cacheRead: 0.022,
    peak: { input: 1.32, output: 3.96, cacheRead: 0.044 },
};
const DEEPSEEK_PRO_FLASH_CUTOVER_MS = Date.parse('2026-09-14T04:00:00Z');
const DEEPSEEK_FLASH_MODEL_IDS = new Set([
    'deepseek-flash',
    'deepseek-v4-flash',
    'deepseek-v4-flash-vision-exp',
]);
const DEEPSEEK_FLASH_CATALOG_STUB = {
    id: 'deepseek-flash',
    name: 'DeepSeek V4.1 Flash',
    reasoning: true,
    tool_call: true,
    modalities: { input: ['text', 'image'], output: ['text'] },
};
function deepseekSeedRates(modelId, atMs = Date.now()) {
    if (DEEPSEEK_FLASH_MODEL_IDS.has(modelId))
        return DEEPSEEK_FLASH_RATES;
    if (modelId === 'deepseek-v4-pro') {
        return atMs >= DEEPSEEK_PRO_FLASH_CUTOVER_MS ? DEEPSEEK_FLASH_RATES : DEEPSEEK_PRO_RATES;
    }
    return undefined;
}
const VERSION_SUFFIX_RE = /-\d{3}$/;
const DATE_SUFFIX_RE = /-\d{4}-?\d{2}-?\d{2}$/;
const SHORT_DATE_SUFFIX_RE = /-\d{4}$/;
const LATEST_SUFFIX = '-latest';
const REASONING_SUFFIX_RE = /-(reasoning|non-reasoning)$/;
const LEGACY_NAME_ALIASES = new Map([
    ['open-mistral-nemo', 'mistral-nemo'],
    ['mistral-tiny', 'open-mistral-7b'],
]);
const MODEL_ID_PREFIX_ALIASES = new Map([
    ['moonshotai.', 'moonshot.'],
]);
const INSTRUCT_SUFFIX_RE = /-instruct$/;
const OPENROUTER_VARIANT_SUFFIX_RE = /:[a-z0-9-]+$/;
const OLLAMA_TAG_SUFFIX_RE = /:(?:preview|\d{4})$/;
let ModelsDevSyncService = ModelsDevSyncService_1 = class ModelsDevSyncService {
    logger = new common_1.Logger(ModelsDevSyncService_1.name);
    cache = new Map();
    capabilityCache = new Map();
    customProviderCache = new Map();
    customProviderIndex = new Map();
    lastFetchedAt = null;
    initialLoad = null;
    onModuleInit() {
        this.initialLoad = this.refreshCache()
            .then(() => undefined)
            .catch((err) => {
            this.logger.error(`Startup models.dev cache refresh failed: ${err}`);
        });
    }
    whenInitialized() {
        return this.initialLoad ?? Promise.resolve();
    }
    async refreshCache() {
        this.logger.log('Refreshing models.dev cache...');
        const raw = await this.fetchModelsDevData();
        if (!raw)
            return 0;
        const newCache = new Map();
        const newCustomProviderCache = new Map();
        const newCustomProviderIndex = new Map();
        let totalModels = 0;
        for (const [modelsDevId, provider] of Object.entries(raw)) {
            if (!provider?.models)
                continue;
            const modelMap = new Map();
            for (const [modelId, model] of Object.entries(provider.models)) {
                if (!this.isChatCompatible(model))
                    continue;
                modelMap.set(modelId, this.parseModel(modelsDevId, modelId, model));
            }
            if (modelMap.size > 0) {
                newCustomProviderCache.set(modelsDevId, modelMap);
                this.indexCustomProvider(newCustomProviderIndex, modelsDevId, provider);
            }
        }
        for (const [ourId, modelsDevId] of Object.entries(PROVIDER_ID_MAP)) {
            const provider = raw[modelsDevId];
            if (!provider?.models)
                continue;
            const modelMap = new Map();
            for (const [modelId, model] of Object.entries(provider.models)) {
                if (!this.isChatCompatible(model))
                    continue;
                const entry = this.parseModel(ourId, modelId, model);
                modelMap.set(modelId, entry);
                totalModels++;
            }
            if (ourId === 'deepseek' && !modelMap.has('deepseek-flash')) {
                modelMap.set('deepseek-flash', this.parseModel(ourId, 'deepseek-flash', DEEPSEEK_FLASH_CATALOG_STUB));
                totalModels++;
            }
            if (modelMap.size > 0) {
                newCache.set(ourId, modelMap);
            }
        }
        const newCapabilityCache = new Map();
        for (const [ourId, modelsDevId] of Object.entries(CAPABILITY_ONLY_PROVIDER_ID_MAP)) {
            const provider = raw[modelsDevId];
            if (!provider?.models)
                continue;
            const modelMap = new Map();
            for (const [modelId, model] of Object.entries(provider.models)) {
                if (!this.isChatCompatible(model))
                    continue;
                modelMap.set(modelId, this.parseModel(ourId, modelId, model));
            }
            if (modelMap.size > 0) {
                newCapabilityCache.set(ourId, modelMap);
            }
        }
        this.cache = newCache;
        this.capabilityCache = newCapabilityCache;
        this.customProviderCache = newCustomProviderCache;
        this.customProviderIndex = newCustomProviderIndex;
        this.lastFetchedAt = new Date();
        this.logger.log(`models.dev cache loaded: ${newCache.size} providers, ${totalModels} models`);
        return totalModels;
    }
    lookupModel(providerId, modelId) {
        const resolvedProviderId = resolveProviderId(providerId);
        const providerModels = this.cache.get(resolvedProviderId);
        if (!providerModels)
            return null;
        return this.lookupModelInProvider(providerModels, modelId, resolvedProviderId);
    }
    lookupCustomProviderModel(providerName, modelId) {
        const providerKey = this.resolveCustomProviderKey(providerName);
        if (!providerKey)
            return null;
        const providerModels = this.customProviderCache.get(providerKey);
        if (!providerModels)
            return null;
        return this.lookupModelInProvider(providerModels, modelId);
    }
    lookupModelCapabilities(providerId, modelId) {
        const native = this.lookupModel(providerId, modelId);
        if (native)
            return native;
        const resolvedProviderId = resolveProviderId(providerId);
        const providerModels = this.capabilityCache.get(resolvedProviderId);
        if (!providerModels)
            return null;
        return this.lookupModelInProvider(providerModels, modelId, resolvedProviderId);
    }
    lookupModelAcrossProviders(modelId) {
        const providerScoped = this.lookupProviderScopedModel(modelId);
        if (providerScoped)
            return providerScoped;
        for (const [providerId, providerModels] of this.cache) {
            const found = this.lookupModelInProvider(providerModels, modelId, providerId);
            if (found)
                return found;
        }
        for (const providerModels of this.customProviderCache.values()) {
            const exact = providerModels.get(modelId);
            if (exact)
                return exact;
        }
        return null;
    }
    lookupProviderScopedModel(modelId) {
        const slash = modelId.indexOf('/');
        if (slash <= 0 || slash === modelId.length - 1)
            return null;
        const providerPart = modelId.slice(0, slash);
        const nativeModelId = modelId.slice(slash + 1);
        return this.lookupModel(providerPart, nativeModelId);
    }
    lookupModelInProvider(providerModels, modelId, providerId) {
        const exact = providerModels.get(modelId);
        if (exact)
            return exact;
        const versioned = this.lookupVersionedModelVariant(providerModels, modelId);
        if (versioned)
            return versioned;
        const aliasBase = modelId
            .replace(DATE_SUFFIX_RE, '')
            .replace(SHORT_DATE_SUFFIX_RE, '')
            .replace(/-latest$/, '');
        const aliasTarget = LEGACY_NAME_ALIASES.get(aliasBase) ??
            LEGACY_NAME_ALIASES.get(modelId) ??
            LEGACY_NAME_ALIASES.get(modelId.replace(/-latest$/, ''));
        if (aliasTarget) {
            const found = providerModels.get(aliasTarget);
            if (found)
                return found;
        }
        const prefixAlias = this.applyModelIdPrefixAlias(modelId);
        if (prefixAlias) {
            const found = providerModels.get(prefixAlias);
            if (found)
                return found;
            const aliasVersioned = this.lookupVersionedModelVariant(providerModels, prefixAlias);
            if (aliasVersioned)
                return aliasVersioned;
        }
        const noVersion = modelId.replace(VERSION_SUFFIX_RE, '');
        if (noVersion !== modelId) {
            const found = providerModels.get(noVersion);
            if (found)
                return found;
        }
        const noDate = modelId.replace(DATE_SUFFIX_RE, '');
        if (noDate !== modelId) {
            const found = providerModels.get(noDate);
            if (found)
                return found;
        }
        if (!modelId.endsWith(LATEST_SUFFIX)) {
            const withLatest = providerModels.get(modelId + LATEST_SUFFIX);
            if (withLatest)
                return withLatest;
        }
        if (noDate !== modelId && !noDate.endsWith(LATEST_SUFFIX)) {
            const found = providerModels.get(noDate + LATEST_SUFFIX);
            if (found)
                return found;
        }
        const noGoogleVariant = modelId.replace(model_name_normalizer_1.GOOGLE_VARIANT_RE, '');
        if (noGoogleVariant !== modelId) {
            const found = providerModels.get(noGoogleVariant);
            if (found)
                return found;
        }
        const noReasoning = modelId.replace(REASONING_SUFFIX_RE, '');
        if (noReasoning !== modelId) {
            const found = providerModels.get(noReasoning);
            if (found)
                return found;
        }
        if (providerId === 'ollama-cloud') {
            const noTag = modelId.replace(OLLAMA_TAG_SUFFIX_RE, '');
            if (noTag !== modelId) {
                const found = providerModels.get(noTag);
                if (found)
                    return found;
            }
        }
        if (providerId === 'openrouter') {
            const noVariant = modelId.replace(OPENROUTER_VARIANT_SUFFIX_RE, '');
            if (noVariant !== modelId) {
                const found = providerModels.get(noVariant);
                if (found)
                    return found;
            }
        }
        if (providerId === 'bedrock') {
            const noInstruct = modelId.replace(INSTRUCT_SUFFIX_RE, '');
            if (noInstruct !== modelId) {
                const found = providerModels.get(noInstruct);
                if (found)
                    return found;
                const versionedBase = this.lookupVersionedModelVariant(providerModels, noInstruct);
                if (versionedBase)
                    return versionedBase;
            }
        }
        const noShortDate = modelId.replace(SHORT_DATE_SUFFIX_RE, '');
        if (noShortDate !== modelId) {
            const found = providerModels.get(noShortDate);
            if (found)
                return found;
            if (!noShortDate.endsWith(LATEST_SUFFIX)) {
                const withLatest = providerModels.get(noShortDate + LATEST_SUFFIX);
                if (withLatest)
                    return withLatest;
            }
        }
        if (modelId.endsWith(LATEST_SUFFIX)) {
            const base = modelId.slice(0, -LATEST_SUFFIX.length);
            const prefix = `${base}-`;
            for (const [key, entry] of providerModels) {
                if (key.startsWith(prefix) && key !== modelId)
                    return entry;
            }
            const baseMatch = providerModels.get(base);
            if (baseMatch)
                return baseMatch;
        }
        return null;
    }
    lookupVersionedModelVariant(providerModels, modelId) {
        for (const suffix of ['-v1:0', '-v1', '-1:0', '-1']) {
            const found = providerModels.get(`${modelId}${suffix}`);
            if (found)
                return found;
        }
        const dottedVersion = modelId.replace(/^(.*\.[A-Za-z0-9-]*\d)\.(\d+)$/, '$1-v$2:0');
        if (dottedVersion !== modelId) {
            const found = providerModels.get(dottedVersion);
            if (found)
                return found;
        }
        const escaped = modelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const variantRe = new RegExp(`^${escaped}-(?:v\\d+(?::\\d+)?|\\d+:\\d+)$`);
        for (const [key, entry] of providerModels) {
            if (variantRe.test(key))
                return entry;
        }
        return null;
    }
    applyModelIdPrefixAlias(modelId) {
        for (const [from, to] of MODEL_ID_PREFIX_ALIASES) {
            if (modelId.startsWith(from))
                return `${to}${modelId.slice(from.length)}`;
        }
        return null;
    }
    resolveCustomProviderKey(providerName) {
        const trimmed = providerName.trim();
        if (!trimmed)
            return null;
        return (this.customProviderIndex.get(trimmed.toLowerCase()) ??
            this.customProviderIndex.get((0, manifest_shared_1.normalizeProviderName)(trimmed)) ??
            null);
    }
    getModelsForProvider(providerId) {
        const providerModels = this.cache.get(resolveProviderId(providerId));
        if (!providerModels)
            return [];
        return [...providerModels.values()];
    }
    isProviderSupported(providerId) {
        return SUPPORTED_PROVIDERS.has(resolveProviderId(providerId));
    }
    getLastFetchedAt() {
        return this.lastFetchedAt;
    }
    indexCustomProvider(index, modelsDevId, provider) {
        this.addCustomProviderIndexEntry(index, modelsDevId, modelsDevId);
        if (provider.id)
            this.addCustomProviderIndexEntry(index, provider.id, modelsDevId);
        if (provider.name)
            this.addCustomProviderIndexEntry(index, provider.name, modelsDevId);
    }
    addCustomProviderIndexEntry(index, value, modelsDevId) {
        const trimmed = value.trim();
        if (!trimmed)
            return;
        const lower = trimmed.toLowerCase();
        if (!index.has(lower))
            index.set(lower, modelsDevId);
        const normalized = (0, manifest_shared_1.normalizeProviderName)(trimmed);
        if (!index.has(normalized))
            index.set(normalized, modelsDevId);
    }
    parseTierDays(days) {
        if (!Array.isArray(days) || days.length === 0)
            return null;
        const valid = days.every((day) => typeof day === 'number' && Number.isInteger(day) && day >= 1 && day <= 7);
        return valid ? days : null;
    }
    parseTimeTiers(raw) {
        const tiers = raw.cost?.tiers;
        if (!Array.isArray(tiers))
            return null;
        const parsed = [];
        for (const tier of tiers) {
            if (tier?.tier?.type !== 'time')
                continue;
            const windows = (tier.tier.windows ?? []).filter((window) => typeof window === 'string' &&
                TIME_WINDOW_RE.test(window) &&
                window.slice(0, 5) !== window.slice(6));
            if (windows.length === 0)
                continue;
            parsed.push({
                windows,
                days: this.parseTierDays(tier.tier.days),
                inputPricePerToken: tier.input != null ? tier.input / 1_000_000 : null,
                outputPricePerToken: tier.output != null ? tier.output / 1_000_000 : null,
                cacheReadPricePerToken: tier.cache_read != null ? tier.cache_read / 1_000_000 : null,
                cacheWritePricePerToken: tier.cache_write != null ? tier.cache_write / 1_000_000 : null,
            });
        }
        return parsed.length > 0 ? parsed : null;
    }
    parseModel(providerId, modelId, raw) {
        let inputPerMillion = raw.cost?.input ?? null;
        let outputPerMillion = raw.cost?.output ?? null;
        let cacheReadPerMillion = raw.cost?.cache_read ?? null;
        let cacheWritePerMillion = raw.cost?.cache_write ?? null;
        let timeTiers = this.parseTimeTiers(raw);
        if (providerId === 'deepseek' && !timeTiers) {
            const seed = deepseekSeedRates(modelId);
            if (seed) {
                inputPerMillion = seed.input;
                outputPerMillion = seed.output;
                cacheReadPerMillion = seed.cacheRead;
                cacheWritePerMillion = null;
                timeTiers = [
                    {
                        windows: DEEPSEEK_PEAK_WINDOWS,
                        days: DEEPSEEK_PEAK_DAYS,
                        inputPricePerToken: seed.peak.input / 1_000_000,
                        outputPricePerToken: seed.peak.output / 1_000_000,
                        cacheReadPricePerToken: seed.peak.cacheRead / 1_000_000,
                        cacheWritePricePerToken: null,
                    },
                ];
            }
        }
        const modalities = (0, model_capabilities_1.modelModalitiesFromModelsDev)(raw.modalities);
        return {
            id: modelId,
            name: raw.name || modelId,
            family: raw.family,
            reasoning: raw.reasoning ?? false,
            toolCall: raw.tool_call ?? false,
            structuredOutput: raw.structured_output ?? false,
            contextWindow: raw.limit?.context,
            maxOutputTokens: raw.limit?.output,
            capabilities: (0, model_capabilities_1.capabilitiesFromModelsDev)(providerId, modelId, raw.modalities, raw.tool_call),
            inputModalities: modalities.input,
            outputModalities: modalities.output,
            inputPricePerToken: inputPerMillion !== null ? inputPerMillion / 1_000_000 : null,
            outputPricePerToken: outputPerMillion !== null ? outputPerMillion / 1_000_000 : null,
            cacheReadPricePerToken: cacheReadPerMillion !== null ? cacheReadPerMillion / 1_000_000 : null,
            cacheWritePricePerToken: cacheWritePerMillion !== null ? cacheWritePerMillion / 1_000_000 : null,
            timeTiers,
        };
    }
    isChatCompatible(model) {
        const inputMods = model.modalities?.input?.map((m) => m.toLowerCase());
        if (inputMods && inputMods.length > 0 && !inputMods.includes('text')) {
            return false;
        }
        const outputMods = model.modalities?.output?.map((m) => m.toLowerCase());
        if (outputMods && outputMods.length > 0) {
            return outputMods.includes('text');
        }
        return true;
    }
    async fetchModelsDevData() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
            const res = await fetch(MODELS_DEV_API, { signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok) {
                this.logger.error(`models.dev API returned ${res.status}`);
                return null;
            }
            return (await res.json());
        }
        catch (err) {
            this.logger.error(`Failed to fetch models.dev data: ${err}`);
            return null;
        }
    }
};
exports.ModelsDevSyncService = ModelsDevSyncService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_4AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelsDevSyncService.prototype, "refreshCache", null);
exports.ModelsDevSyncService = ModelsDevSyncService = ModelsDevSyncService_1 = __decorate([
    (0, common_1.Injectable)()
], ModelsDevSyncService);
//# sourceMappingURL=models-dev-sync.service.js.map