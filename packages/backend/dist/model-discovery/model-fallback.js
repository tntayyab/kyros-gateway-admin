"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOpenRouterPrefix = findOpenRouterPrefix;
exports.lookupWithVariants = lookupWithVariants;
exports.buildModelsDevFallback = buildModelsDevFallback;
exports.buildFallbackModels = buildFallbackModels;
exports.buildSubscriptionFallbackModels = buildSubscriptionFallbackModels;
exports.reconcileCachedSubscriptionContextWindow = reconcileCachedSubscriptionContextWindow;
exports.supplementWithKnownModels = supplementWithKnownModels;
const model_fetcher_1 = require("./model-fetcher");
const providers_1 = require("../common/constants/providers");
const manifest_shared_1 = require("manifest-shared");
const anthropic_model_id_1 = require("../common/utils/anthropic-model-id");
const model_name_normalizer_1 = require("../model-prices/model-name-normalizer");
function normalizeProviderModelId(providerId, modelId) {
    return providerId.toLowerCase() === 'anthropic'
        ? (0, anthropic_model_id_1.normalizeAnthropicShortModelId)(modelId)
        : modelId;
}
function findOpenRouterPrefix(providerId) {
    const lower = providerId.toLowerCase();
    if (providers_1.OPENROUTER_PREFIX_TO_PROVIDER.has(lower))
        return lower;
    const entry = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(lower);
    if (entry) {
        for (const prefix of entry.openRouterPrefixes) {
            if (providers_1.OPENROUTER_PREFIX_TO_PROVIDER.has(prefix))
                return prefix;
        }
    }
    for (const [prefix, displayName] of providers_1.OPENROUTER_PREFIX_TO_PROVIDER) {
        if (displayName.toLowerCase() === lower)
            return prefix;
    }
    return null;
}
const OPENROUTER_NAME_ALIASES = new Map([
    ['voxtral-small', 'voxtral-small-24b'],
    ['open-mistral-nemo', 'mistral-nemo'],
    ['mistral-tiny', 'open-mistral-7b'],
]);
const META_FALLBACK_MODEL_IDS = new Set(manifest_shared_1.META_MODEL_API_MODEL_BY_ID.keys());
function lookupWithVariants(pricingSync, prefix, modelId) {
    const exact = pricingSync.lookupPricing(`${prefix}/${modelId}`);
    if (exact)
        return exact;
    for (const [from, to] of OPENROUTER_NAME_ALIASES) {
        if (modelId.includes(from)) {
            const aliased = modelId.replace(from, to);
            const aliasResult = pricingSync.lookupPricing(`${prefix}/${aliased}`);
            if (aliasResult)
                return aliasResult;
        }
    }
    const dotVariant = modelId.replace(/-(\d+)-(\d)/g, '-$1.$2');
    if (dotVariant !== modelId) {
        const dotResult = pricingSync.lookupPricing(`${prefix}/${dotVariant}`);
        if (dotResult)
            return dotResult;
    }
    const dashVariant = modelId.replace(/\.(\d)/g, '-$1');
    if (dashVariant !== modelId) {
        const dashResult = pricingSync.lookupPricing(`${prefix}/${dashVariant}`);
        if (dashResult)
            return dashResult;
    }
    const prefixedModel = providerPrefixedModelId(prefix, modelId);
    if (prefixedModel) {
        const prefixedResult = pricingSync.lookupPricing(`${prefix}/${prefixedModel}`);
        if (prefixedResult)
            return prefixedResult;
    }
    const noDate = modelId.replace(/-\d{8}$/, '');
    if (noDate !== modelId) {
        const noDateResult = pricingSync.lookupPricing(`${prefix}/${noDate}`);
        if (noDateResult)
            return noDateResult;
        const noDateDot = noDate.replace(/-(\d+)-(\d)/g, '-$1.$2');
        if (noDateDot !== noDate) {
            const noDateDotResult = pricingSync.lookupPricing(`${prefix}/${noDateDot}`);
            if (noDateDotResult)
                return noDateDotResult;
        }
    }
    const freeResult = pricingSync.lookupPricing(`${prefix}/${modelId}:free`);
    if (freeResult)
        return freeResult;
    const noGoogleVariant = modelId.replace(model_name_normalizer_1.GOOGLE_VARIANT_RE, '');
    if (noGoogleVariant !== modelId) {
        const result = pricingSync.lookupPricing(`${prefix}/${noGoogleVariant}`);
        if (result)
            return result;
    }
    if (modelId.endsWith('-latest')) {
        const base = modelId.slice(0, -'-latest'.length);
        const scanPrefix = `${prefix}/${base}-`;
        for (const [key] of pricingSync.getAll()) {
            if (key.startsWith(scanPrefix)) {
                const found = pricingSync.lookupPricing(key);
                if (found)
                    return found;
            }
        }
    }
    return null;
}
function providerPrefixedModelId(prefix, modelId) {
    const normalizedPrefix = prefix.toLowerCase();
    if (modelId.toLowerCase().startsWith(`${normalizedPrefix}-`))
        return null;
    return `${prefix}-${modelId}`;
}
function resolveSubscriptionContextWindow(modelId, contextWindow, capabilities) {
    let modelContextWindow;
    let matchLength = -1;
    const normalizedModelId = modelId.toLowerCase();
    for (const [configuredModelId, configuredContextWindow] of Object.entries(capabilities?.modelContextWindows ?? {})) {
        const normalizedConfiguredModelId = configuredModelId.toLowerCase();
        if (normalizedModelId !== normalizedConfiguredModelId &&
            !normalizedModelId.startsWith(`${normalizedConfiguredModelId}-`)) {
            continue;
        }
        if (typeof configuredContextWindow === 'number' &&
            Number.isFinite(configuredContextWindow) &&
            configuredContextWindow > 0 &&
            normalizedConfiguredModelId.length > matchLength) {
            modelContextWindow = configuredContextWindow;
            matchLength = normalizedConfiguredModelId.length;
        }
    }
    if (modelContextWindow)
        return modelContextWindow;
    if (capabilities?.maxContextWindow && contextWindow > capabilities.maxContextWindow) {
        return capabilities.maxContextWindow;
    }
    return contextWindow;
}
function buildModelsDevFallback(modelsDevSync, providerId, options = {}) {
    if (!modelsDevSync)
        return [];
    const entries = modelsDevSync.getModelsForProvider(providerId);
    const idPrefix = options.idPrefix;
    return entries.map((e) => ({
        id: idPrefix ? `${idPrefix}/${e.id}` : e.id,
        displayName: e.name || e.id,
        provider: providerId,
        contextWindow: e.contextWindow ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
        inputPricePerToken: e.inputPricePerToken,
        outputPricePerToken: e.outputPricePerToken,
        capabilityReasoning: e.reasoning ?? false,
        capabilityCode: e.toolCall ?? false,
        ...(e.inputModalities ? { inputModalities: e.inputModalities } : {}),
        ...(e.outputModalities ? { outputModalities: e.outputModalities } : {}),
        qualityScore: 3,
    }));
}
function buildFallbackModels(pricingSync, providerId, confirmedModels) {
    if (!pricingSync)
        return [];
    const models = [];
    const seen = new Set();
    const hasConfirmed = confirmedModels != null && confirmedModels.size > 0;
    const orPrefix = findOpenRouterPrefix(providerId);
    if (!orPrefix)
        return [];
    const isMeta = providerId.toLowerCase() === 'meta';
    for (const [fullId, entry] of pricingSync.getAll()) {
        if (!fullId.startsWith(`${orPrefix}/`))
            continue;
        if (fullId.endsWith(':batch'))
            continue;
        const modelId = normalizeProviderModelId(providerId, fullId.substring(orPrefix.length + 1));
        if (seen.has(modelId))
            continue;
        if (hasConfirmed && !confirmedModels.has(modelId.toLowerCase()))
            continue;
        if (isMeta && !META_FALLBACK_MODEL_IDS.has(modelId))
            continue;
        seen.add(modelId);
        const metaModel = isMeta ? manifest_shared_1.META_MODEL_API_MODEL_BY_ID.get(modelId) : undefined;
        models.push({
            id: modelId,
            displayName: metaModel?.displayName ?? entry.displayName ?? modelId,
            provider: providerId,
            contextWindow: entry.contextWindow ?? (metaModel ? manifest_shared_1.META_MODEL_API_CONTEXT_WINDOW : model_fetcher_1.DEFAULT_CONTEXT_WINDOW),
            inputPricePerToken: entry.input,
            outputPricePerToken: entry.output,
            capabilityReasoning: !!metaModel,
            capabilityCode: !!metaModel,
            ...(metaModel
                ? {
                    inputModalities: ['text', 'image', 'audio', 'video'],
                    outputModalities: ['text'],
                }
                : {}),
            qualityScore: 3,
        });
    }
    return models;
}
function buildSubscriptionFallbackModels(providerId) {
    const knownModels = (0, manifest_shared_1.getSubscriptionKnownModels)(providerId);
    if (!knownModels)
        return [];
    const capabilities = (0, manifest_shared_1.getSubscriptionCapabilities)(providerId);
    const defaultCtx = capabilities?.maxContextWindow ?? 200000;
    return knownModels.map((modelId) => ({
        id: modelId,
        displayName: modelId,
        provider: providerId,
        contextWindow: resolveSubscriptionContextWindow(modelId, defaultCtx, capabilities),
        contextWindowSource: 'subscription_config',
        inputPricePerToken: 0,
        outputPricePerToken: 0,
        capabilityReasoning: false,
        capabilityCode: false,
        qualityScore: 3,
    }));
}
function reconcileCachedSubscriptionContextWindow(model, providerId) {
    if (model.contextWindowSource !== 'subscription_config')
        return model;
    const knownModels = (0, manifest_shared_1.getSubscriptionKnownModels)(providerId);
    if (!knownModels)
        return model;
    const matchMode = (0, manifest_shared_1.getSubscriptionKnownModelsMatch)(providerId);
    const normalizedModelId = model.id.toLowerCase();
    const isKnownModel = knownModels.some((knownModel) => {
        const normalizedKnownModel = knownModel.toLowerCase();
        if (normalizedKnownModel === normalizedModelId)
            return true;
        return matchMode !== 'exact' && normalizedModelId.startsWith(`${normalizedKnownModel}-`);
    });
    if (!isKnownModel)
        return model;
    const capabilities = (0, manifest_shared_1.getSubscriptionCapabilities)(providerId);
    const contextWindow = resolveSubscriptionContextWindow(model.id, capabilities?.maxContextWindow ?? 200000, capabilities);
    if (contextWindow === model.contextWindow)
        return model;
    return { ...model, contextWindow };
}
function supplementWithKnownModels(raw, providerId) {
    const knownModels = (0, manifest_shared_1.getSubscriptionKnownModels)(providerId);
    if (!knownModels)
        return raw;
    const matchMode = (0, manifest_shared_1.getSubscriptionKnownModelsMatch)(providerId);
    const capabilities = (0, manifest_shared_1.getSubscriptionCapabilities)(providerId);
    const defaultCtx = capabilities?.maxContextWindow ?? 200000;
    for (const modelId of knownModels) {
        const lowerModelId = modelId.toLowerCase();
        const covered = raw.some((m) => {
            const lowerDiscovered = m.id.toLowerCase();
            if (lowerDiscovered === lowerModelId)
                return true;
            return matchMode !== 'exact' && lowerDiscovered.startsWith(`${lowerModelId}-`);
        });
        if (covered)
            continue;
        raw.push({
            id: modelId,
            displayName: modelId,
            provider: providerId,
            contextWindow: resolveSubscriptionContextWindow(modelId, defaultCtx, capabilities),
            contextWindowSource: 'subscription_config',
            inputPricePerToken: 0,
            outputPricePerToken: 0,
            capabilityReasoning: false,
            capabilityCode: false,
            qualityScore: 3,
        });
    }
    return raw;
}
//# sourceMappingURL=model-fallback.js.map