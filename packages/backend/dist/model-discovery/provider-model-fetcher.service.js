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
var ProviderModelFetcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderModelFetcherService = exports.PROVIDER_CONFIGS = exports.PROVIDER_BLOCKLIST = exports.PROVIDER_NON_CHAT = exports.UNIVERSAL_NON_CHAT_RE = void 0;
exports.filterNonChatModels = filterNonChatModels;
const common_1 = require("@nestjs/common");
const model_fetcher_1 = require("./model-fetcher");
const model_capabilities_1 = require("./model-capabilities");
const managed_free_providers_1 = require("../common/constants/managed-free-providers");
const ollama_1 = require("../common/constants/ollama");
const subscription_clients_1 = require("../common/constants/subscription-clients");
const provider_base_url_1 = require("../routing/provider-base-url");
const qwen_region_1 = require("../routing/qwen-region");
const bedrock_region_1 = require("../routing/bedrock-region");
const bedrock_runtime_capabilities_1 = require("../routing/bedrock-runtime-capabilities");
const xiaomi_region_1 = require("../routing/xiaomi-region");
const zai_region_1 = require("../routing/zai-region");
const minimax_oauth_helpers_1 = require("../routing/oauth/minimax/minimax-oauth-helpers");
const opencode_go_catalog_service_1 = require("./opencode-go-catalog.service");
const kiro_adapter_1 = require("../routing/proxy/kiro-adapter");
const manifest_shared_1 = require("manifest-shared");
const FETCH_TIMEOUT_MS = 5000;
const ANTHROPIC_DEFAULT_CONTEXT = 200000;
const BYTEPLUS_CODING_MODELS_URL = 'https://ark.ap-southeast.bytepluses.com/api/coding/v3/models';
const GEMINI_DEFAULT_CONTEXT = 1000000;
const MINIMAX_SUBSCRIPTION_MODELS_URL = 'https://api.minimax.io/anthropic/v1/models?limit=100';
const COMMAND_CODE_MODELS_URL = 'https://api.commandcode.ai/provider/v1/models';
const XIAOMI_MIMO_MODELS_URL = 'https://api.xiaomimimo.com/v1/models';
const XIAOMI_TOKEN_PLAN_MODELS_URL = `${(0, xiaomi_region_1.getXiaomiTokenPlanBaseUrl)()}/v1/models`;
const QWEN_TOKEN_PLAN_MODELS_URL = 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/models';
const QWEN_TOKEN_PLAN_CONTEXT_WINDOW = 991000;
const KILO_GATEWAY_BASE = 'https://api.kilo.ai/api/gateway';
const FIREWORKS_MODELS_URL = 'https://api.fireworks.ai/v1/accounts/fireworks/models';
const HUGGING_FACE_MODELS_URL = 'https://router.huggingface.co/v1/models';
const FIREWORKS_MODELS_PAGE_SIZE = 200;
const FIREWORKS_MODELS_MAX_PAGES = 20;
const NOUS_PORTAL_MODELS_URL = 'https://inference-api.nousresearch.com/v1/models';
const OPENCODE_GO_MODELS_URL = 'https://opencode.ai/zen/go/v1/models';
const PIONEER_MODELS_URL = 'https://api.pioneer.ai/v1/models';
const PIONEER_BASE_MODELS_URL = 'https://api.pioneer.ai/base-models';
const META_MODELS_URL = 'https://api.meta.ai/v1/models';
const COPILOT_AI_CREDIT_USD = 0.01;
function resolvePerEntry(value, entry) {
    return typeof value === 'function' ? value(entry) : value;
}
function createModelParser(config) {
    return (body, provider) => {
        const arr = body?.[config.arrayKey];
        if (!Array.isArray(arr))
            return [];
        return arr
            .filter((m) => config.filter(m))
            .map((m) => {
            const entry = m;
            const id = config.getId(entry);
            const ctxVal = config.contextWindow ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW;
            const contextWindowSource = config.contextWindowSource?.(entry);
            const supportedEndpoints = config.supportedEndpoints?.(entry);
            const inputModalities = resolvePerEntry(config.inputModalities, entry);
            const outputModalities = resolvePerEntry(config.outputModalities, entry);
            return {
                id,
                displayName: config.getDisplayName(entry, id),
                provider,
                contextWindow: typeof ctxVal === 'function' ? ctxVal(entry) : ctxVal,
                ...(contextWindowSource ? { contextWindowSource } : {}),
                inputPricePerToken: config.inputPricePerToken ?? null,
                outputPricePerToken: config.outputPricePerToken ?? null,
                capabilityReasoning: config.capabilityReasoning ?? false,
                capabilityCode: typeof config.capabilityCode === 'function'
                    ? config.capabilityCode(entry)
                    : (config.capabilityCode ?? false),
                ...(inputModalities ? { inputModalities } : {}),
                ...(outputModalities ? { outputModalities } : {}),
                ...(supportedEndpoints && supportedEndpoints.length > 0 ? { supportedEndpoints } : {}),
                qualityScore: config.qualityScore ?? 3,
            };
        });
    };
}
function getStringArray(value) {
    if (!Array.isArray(value))
        return undefined;
    const strings = value.filter((entry) => typeof entry === 'string');
    return strings.length > 0 ? strings : undefined;
}
const parseOpenAI = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && entry.id.length > 0,
    getId: (entry) => entry.id,
    getDisplayName: (_entry, id) => id,
    inputModalities: (entry) => (0, model_capabilities_1.parseModalities)(entry.input_modalities),
    outputModalities: (entry) => (0, model_capabilities_1.parseModalities)(entry.output_modalities),
});
const isBedrockRuntimeProfile = (id) => (0, bedrock_runtime_capabilities_1.getBedrockRuntimeSupportedEndpoints)(id).length > 0;
const parseBedrockCrisProfiles = createModelParser({
    arrayKey: 'inferenceProfileSummaries',
    filter: (entry) => entry.status === 'ACTIVE' && isBedrockRuntimeProfile(entry.inferenceProfileId),
    getId: (entry) => entry.inferenceProfileId,
    getDisplayName: (_entry, id) => id,
    supportedEndpoints: (entry) => (0, bedrock_runtime_capabilities_1.getBedrockRuntimeSupportedEndpoints)(entry.inferenceProfileId),
});
function parseManagedFreeLiteLlm(body, provider, config) {
    const models = parseOpenAI(body, provider).filter((model) => {
        const bare = model.id.slice(model.id.lastIndexOf('/') + 1);
        return !model.id.includes('*') && bare.startsWith(config.catalogModelIdPrefix);
    });
    const byBareId = new Map();
    for (const model of models) {
        const bare = model.id.slice(model.id.lastIndexOf('/') + 1);
        const existing = byBareId.get(bare);
        if (!existing ||
            (model.id.startsWith(config.preferredModelIdPrefix) &&
                !existing.id.startsWith(config.preferredModelIdPrefix))) {
            byBareId.set(bare, model);
        }
    }
    return Array.from(byBareId.values());
}
const parsePioneer = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && entry.id.length > 0,
    getId: (entry) => entry.id,
    getDisplayName: (entry, id) => entry.display_name || id,
    contextWindow: (entry) => entry.context_length ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
});
function perMillionToPerToken(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
        ? value / 1_000_000
        : null;
}
function fastestLiveHuggingFaceProvider(value) {
    if (!Array.isArray(value))
        return undefined;
    const live = value.filter((provider) => !!provider && typeof provider === 'object' && provider.status === 'live');
    return live.reduce((fastest, provider) => {
        if (!fastest)
            return provider;
        const throughput = typeof provider.throughput === 'number' && Number.isFinite(provider.throughput)
            ? provider.throughput
            : -1;
        const fastestThroughput = typeof fastest.throughput === 'number' && Number.isFinite(fastest.throughput)
            ? fastest.throughput
            : -1;
        return throughput > fastestThroughput ? provider : fastest;
    }, undefined);
}
function parseHuggingFace(body, provider) {
    const data = body?.data;
    if (!Array.isArray(data))
        return [];
    return data.flatMap((raw) => {
        const entry = raw;
        if (typeof entry.id !== 'string' || entry.id.length === 0)
            return [];
        const fastest = fastestLiveHuggingFaceProvider(entry.providers);
        if (!fastest)
            return [];
        const inputModalities = (0, model_capabilities_1.parseModalities)(entry.architecture?.input_modalities);
        const outputModalities = (0, model_capabilities_1.parseModalities)(entry.architecture?.output_modalities);
        const capabilities = [];
        for (const modality of [...(inputModalities ?? []), ...(outputModalities ?? [])]) {
            if (!capabilities.includes(modality))
                capabilities.push(modality);
        }
        capabilities.push('stream');
        if (fastest.supports_tools === true)
            capabilities.push('tools');
        return [
            {
                id: entry.id,
                displayName: entry.id,
                provider,
                contextWindow: fastest.context_length ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
                inputPricePerToken: perMillionToPerToken(fastest.pricing?.input),
                outputPricePerToken: perMillionToPerToken(fastest.pricing?.output),
                capabilityReasoning: false,
                capabilityCode: fastest.supports_tools === true,
                capabilities,
                ...(inputModalities ? { inputModalities } : {}),
                ...(outputModalities ? { outputModalities } : {}),
                qualityScore: 3,
            },
        ];
    });
}
function parsePioneerBaseCatalog(body) {
    const models = body?.models;
    const byId = new Map();
    if (!Array.isArray(models))
        return byId;
    for (const model of models) {
        const entry = model;
        if (typeof entry.id !== 'string' || entry.id.length === 0)
            continue;
        byId.set(entry.id, entry);
    }
    return byId;
}
function enrichPioneerModels(models, catalog) {
    return models.map((model) => {
        const base = catalog.get(model.id);
        if (!base)
            return model;
        return {
            ...model,
            displayName: base.label || model.displayName,
            contextWindow: base.context_window ?? model.contextWindow,
            inputPricePerToken: perMillionToPerToken(base.input_price_per_million),
            outputPricePerToken: perMillionToPerToken(base.output_price_per_million),
            capabilityCode: base.is_chat_model !== false ? model.capabilityCode : false,
            ...(base.supports_image_input ? { inputModalities: ['text', 'image'] } : {}),
        };
    });
}
const parseCommandCode = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && entry.id.length > 0,
    getId: (entry) => `commandcode/${entry.id}`,
    getDisplayName: (entry, id) => entry.name || id,
    contextWindow: (entry) => entry.context_length ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
    capabilityCode: true,
});
const parseBytePlusCodingPlan = (body, provider) => {
    const known = new Set((0, manifest_shared_1.getSubscriptionKnownModels)('byteplus') ?? []);
    return parseOpenAI(body, provider).filter((model) => known.has(model.id));
};
const parseQwenTokenPlan = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && entry.id.length > 0,
    getId: (entry) => entry.id,
    getDisplayName: (_entry, id) => id,
    contextWindow: QWEN_TOKEN_PLAN_CONTEXT_WINDOW,
    inputPricePerToken: 0,
    outputPricePerToken: 0,
});
const XIAOMI_MIMO_CONTEXT_WINDOWS = new Map([
    ['mimo-v2.5-pro', 1048576],
    ['mimo-v2-pro', 1048576],
    ['mimo-v2.5', 1048576],
    ['mimo-v2-omni', 262144],
    ['mimo-v2-flash', 262144],
]);
const parseXiaomiMimo = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && entry.id.startsWith('mimo-v'),
    getId: (entry) => entry.id,
    getDisplayName: (_entry, id) => id,
    contextWindow: (entry) => XIAOMI_MIMO_CONTEXT_WINDOWS.get(entry.id) ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
    capabilityCode: true,
});
const parseMeta = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && manifest_shared_1.META_MODEL_API_MODEL_BY_ID.has(entry.id),
    getId: (entry) => entry.id,
    getDisplayName: (_entry, id) => manifest_shared_1.META_MODEL_API_MODEL_BY_ID.get(id)?.displayName ?? id,
    contextWindow: manifest_shared_1.META_MODEL_API_CONTEXT_WINDOW,
    capabilityReasoning: true,
    capabilityCode: true,
    inputModalities: ['text', 'image', 'audio', 'video'],
    outputModalities: ['text'],
});
const OPENAI_DATE_SUFFIX_RE = /-\d{4}-\d{2}-\d{2}$/;
function parseOpenAIDeduped(body, provider) {
    const parsed = parseOpenAI(body, provider);
    const ids = new Set(parsed.map((m) => m.id));
    return parsed.filter((m) => {
        if (!OPENAI_DATE_SUFFIX_RE.test(m.id))
            return true;
        const alias = m.id.replace(OPENAI_DATE_SUFFIX_RE, '');
        return !ids.has(alias);
    });
}
function parseOpenAIDedupedById(body, provider) {
    const parsed = parseOpenAI(body, provider);
    const seen = new Set();
    return parsed.filter((m) => {
        if (seen.has(m.id))
            return false;
        seen.add(m.id);
        return true;
    });
}
exports.UNIVERSAL_NON_CHAT_RE = /(?:embed|tts|whisper|dall-e|imagen|cogview|wanx|sambert|paraformer|text-embedding|speech-to|voice-|audio-turbo)/i;
exports.PROVIDER_NON_CHAT = {
    openai: /(?:moderation|davinci|babbage|^text-|realtime|-transcribe|^sora|^gpt-3\.5-turbo-instruct|audio|^chatgpt-image|^gpt-image-|search-api)/i,
    'openai-subscription': /(?:moderation|davinci|babbage|^text-|realtime|-transcribe|^sora|audio|^chatgpt-image|^gpt-image-)/i,
    gemini: /(?:^aqs-|nano-banana|^deep-research|computer-use|^lyria|^gemini-2\.0-flash-lite$|flash-lite-preview-\d{2}-\d{4}$|robotics)/i,
    vertex: /(?:^aqs-|nano-banana|^deep-research|computer-use|^lyria|^imagen|^veo|robotics|flash-lite-preview-\d{2}-\d{4}$)/i,
    ...Object.fromEntries(managed_free_providers_1.MANAGED_FREE_PROVIDER_CONFIGS.map((config) => [config.id, config.nonChatModelPattern])),
    mistral: /(?:^mistral-ocr|moderation|voxtral-.*-(?:transcribe|realtime)|^labs-|^mistral-vibe-cli)/i,
    'mistral-subscription': /(?:^mistral-ocr|moderation|voxtral-.*-(?:transcribe|realtime)|^labs-)/i,
    groq: /(?:(?:^|\/|-)compound|prompt-guard|orpheus)/i,
    fireworks: /(?:flux|stable-diffusion|image|embedding|rerank|speech|audio|whisper|tts|upscaler|controlnet)/i,
    nvidia: /(?:flux|cosmos|detector|gliner|calibration|embed|retriever|parse|tts|translate|safety|guard|reward|nvclip|vila|neva)/i,
    xiaomi: /(?:asr|tts)/i,
    'xiaomi-subscription': /(?:asr|tts)/i,
    'qwen-subscription': /(?:^qwen-image-|^wan.*image)/i,
    xai: /imagine/i,
    copilot: /accounts\/[^/]+\/routers\//i,
    bedrock: /(?:^|[./])voxtral-/i,
    pioneer: /(?:gliner|gliguard|privacy-filter|^fastino\/)/i,
};
exports.PROVIDER_BLOCKLIST = {
    'openai-subscription': new Set([
        'gpt-5.3-codex',
        'gpt-5.2-codex',
        'gpt-5.2',
        'gpt-5.1-codex-max',
        'gpt-5.1-codex',
    ]),
    mistral: new Set([
        'voxtral-mini-2602',
    ]),
    'mistral-subscription': new Set([
        'voxtral-mini-2602',
    ]),
};
function filterNonChatModels(models, configKey) {
    const providerFilter = exports.PROVIDER_NON_CHAT[configKey];
    const blocklist = exports.PROVIDER_BLOCKLIST[configKey];
    return models.filter((m) => {
        if (exports.UNIVERSAL_NON_CHAT_RE.test(m.id))
            return false;
        if (providerFilter && providerFilter.test(m.id))
            return false;
        if (blocklist && blocklist.has(m.id))
            return false;
        return true;
    });
}
function bearerHeaders(key) {
    return { Authorization: `Bearer ${key}` };
}
function pioneerHeaders(key) {
    return { 'X-API-Key': key };
}
const parseMistral = createModelParser({
    arrayKey: 'data',
    filter: (entry) => {
        if (typeof entry.id !== 'string' || entry.id.length === 0)
            return false;
        if (entry.deprecation != null)
            return false;
        if (entry.capabilities && entry.capabilities.completion_chat === false)
            return false;
        return true;
    },
    getId: (entry) => entry.id,
    getDisplayName: (_entry, id) => id,
});
const parseMistralVibeSubscription = (body, provider) => {
    const known = new Set((0, manifest_shared_1.getSubscriptionKnownModels)('mistral') ?? []);
    return parseMistral(body, provider).filter((model) => known.has(model.id));
};
const parseAnthropic = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && entry.type === 'model',
    getId: (entry) => entry.id,
    getDisplayName: (entry, id) => entry.display_name || id,
    contextWindow: ANTHROPIC_DEFAULT_CONTEXT,
});
const GEMINI_VERSION_SUFFIX_RE = /-\d{3}$/;
function parseGemini(body, provider) {
    const models = body?.models;
    if (!Array.isArray(models))
        return [];
    const parsed = models
        .filter((m) => {
        const entry = m;
        if (typeof entry.name !== 'string')
            return false;
        const methods = entry.supportedGenerationMethods;
        return Array.isArray(methods) && methods.includes('generateContent');
    })
        .map((m) => {
        const entry = m;
        const id = entry.name.replace(/^models\//, '');
        return {
            id,
            displayName: entry.displayName || id,
            provider,
            contextWindow: entry.inputTokenLimit ?? GEMINI_DEFAULT_CONTEXT,
            inputPricePerToken: null,
            outputPricePerToken: null,
            capabilityReasoning: false,
            capabilityCode: false,
            qualityScore: 3,
        };
    });
    const ids = new Set(parsed.map((m) => m.id));
    return parsed.filter((m) => {
        if (!GEMINI_VERSION_SUFFIX_RE.test(m.id))
            return true;
        const alias = m.id.replace(GEMINI_VERSION_SUFFIX_RE, '');
        return !ids.has(alias);
    });
}
const parseFireworks = createModelParser({
    arrayKey: 'models',
    filter: (entry) => typeof entry.name === 'string' && entry.name.length > 0 && entry.supportsServerless !== false,
    getId: (entry) => entry.name,
    getDisplayName: (entry, id) => entry.displayName || id,
    contextWindow: (entry) => entry.contextLength ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
    capabilityCode: (entry) => entry.supportsTools === true,
});
function parseOpenRouter(body, provider) {
    const data = body?.data;
    if (!Array.isArray(data))
        return [];
    return data
        .filter((m) => {
        const entry = m;
        if (typeof entry.id !== 'string')
            return false;
        if (entry.id.endsWith(':batch'))
            return false;
        const output = entry.architecture?.output_modalities?.map((o) => o.toLowerCase());
        if (output && output.length > 0 && !output.every((o) => o === 'text')) {
            return false;
        }
        return true;
    })
        .map((m) => {
        const entry = m;
        const prompt = entry.pricing?.prompt ? Number(entry.pricing.prompt) : null;
        const completion = entry.pricing?.completion ? Number(entry.pricing.completion) : null;
        const inputModalities = (0, model_capabilities_1.parseModalities)(entry.architecture?.input_modalities);
        const outputModalities = (0, model_capabilities_1.parseModalities)(entry.architecture?.output_modalities);
        return {
            id: entry.id,
            displayName: entry.name || entry.id,
            provider,
            contextWindow: entry.context_length ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
            inputPricePerToken: prompt !== null && Number.isFinite(prompt) && prompt >= 0 ? prompt : null,
            outputPricePerToken: completion !== null && Number.isFinite(completion) && completion >= 0 ? completion : null,
            capabilityReasoning: false,
            capabilityCode: false,
            ...(inputModalities ? { inputModalities } : {}),
            ...(outputModalities ? { outputModalities } : {}),
            qualityScore: 3,
        };
    });
}
function parseKilo(body, provider) {
    const data = body?.data;
    if (!Array.isArray(data))
        return [];
    return data
        .filter((m) => {
        const entry = m;
        if (typeof entry.id !== 'string' || entry.id.length === 0)
            return false;
        const output = entry.architecture?.output_modalities?.map((o) => o.toLowerCase());
        if (output && output.length > 0 && !output.every((o) => o === 'text')) {
            return false;
        }
        return true;
    })
        .map((m) => {
        const entry = m;
        const supported = Array.isArray(entry.supported_parameters) ? entry.supported_parameters : [];
        const prompt = entry.pricing?.prompt ? Number(entry.pricing.prompt) : null;
        const completion = entry.pricing?.completion ? Number(entry.pricing.completion) : null;
        return {
            id: entry.id,
            displayName: entry.name || entry.id,
            provider,
            contextWindow: entry.context_length ?? entry.top_provider?.context_length ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW,
            inputPricePerToken: prompt !== null && Number.isFinite(prompt) && prompt >= 0 ? prompt : null,
            outputPricePerToken: completion !== null && Number.isFinite(completion) && completion >= 0 ? completion : null,
            capabilityReasoning: supported.includes('reasoning') || supported.includes('include_reasoning'),
            capabilityCode: supported.includes('tools'),
            qualityScore: 3,
        };
    });
}
const parseOllama = createModelParser({
    arrayKey: 'models',
    filter: (entry) => typeof entry.name === 'string',
    getId: (entry) => entry.name.replace(/:latest$/, ''),
    getDisplayName: (_entry, id) => id,
    inputPricePerToken: 0,
    outputPricePerToken: 0,
    qualityScore: 2,
});
const parseOpenaiSubscription = createModelParser({
    arrayKey: 'models',
    filter: (entry) => typeof entry.slug === 'string' && entry.visibility === 'list',
    getId: (entry) => entry.slug,
    getDisplayName: (entry, id) => entry.display_name || id,
    contextWindow: (entry) => entry.context_window ?? 200000,
    contextWindowSource: (entry) => typeof entry.context_window === 'number' ? 'provider' : 'subscription_config',
    inputPricePerToken: 0,
    outputPricePerToken: 0,
    capabilityCode: true,
});
function copilotUsdPerToken(price, batchSize) {
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
        return null;
    const tokenBatchSize = batchSize ?? 1_000_000;
    if (typeof tokenBatchSize !== 'number' ||
        !Number.isFinite(tokenBatchSize) ||
        tokenBatchSize <= 0) {
        return null;
    }
    return (price * COPILOT_AI_CREDIT_USD) / tokenBatchSize;
}
function copilotContextMax(tier) {
    const value = tier?.context_max ?? tier?.max_prompt_tokens;
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}
function copilotPriceTier(tier, batchSize) {
    const inputPricePerToken = copilotUsdPerToken(tier?.input_price, batchSize);
    const outputPricePerToken = copilotUsdPerToken(tier?.output_price, batchSize);
    if (inputPricePerToken === null || outputPricePerToken === null)
        return null;
    const cacheReadPricePerToken = copilotUsdPerToken(tier?.cache_read_price ?? tier?.cache_price, batchSize);
    const cacheWritePricePerToken = copilotUsdPerToken(tier?.cache_write_price, batchSize);
    return {
        inputPricePerToken,
        outputPricePerToken,
        ...(cacheReadPricePerToken !== null ? { cacheReadPricePerToken } : {}),
        ...(cacheWritePricePerToken !== null ? { cacheWritePricePerToken } : {}),
    };
}
function parseCopilot(body, provider) {
    const data = body?.data;
    if (!Array.isArray(data))
        return [];
    return data.flatMap((raw) => {
        const entry = raw;
        if (typeof entry.id !== 'string' || entry.id.length === 0)
            return [];
        const tokenPrices = entry.billing?.token_prices;
        const defaultPricing = copilotPriceTier(tokenPrices?.default, tokenPrices?.batch_size);
        const longContextThreshold = copilotContextMax(tokenPrices?.default);
        const longContextTier = copilotPriceTier(tokenPrices?.long_context, tokenPrices?.batch_size);
        const longContextPricing = defaultPricing && longContextTier && longContextThreshold
            ? { thresholdTokens: longContextThreshold, ...longContextTier }
            : null;
        const contextWindow = copilotContextMax(tokenPrices?.long_context) ??
            longContextThreshold ??
            model_fetcher_1.DEFAULT_CONTEXT_WINDOW;
        const supportedEndpoints = getStringArray(entry.supported_endpoints);
        return [
            {
                id: `copilot/${entry.id}`,
                displayName: entry.id,
                provider,
                contextWindow,
                inputPricePerToken: defaultPricing?.inputPricePerToken ?? 0,
                outputPricePerToken: defaultPricing?.outputPricePerToken ?? 0,
                ...(defaultPricing?.cacheReadPricePerToken !== undefined
                    ? { cacheReadPricePerToken: defaultPricing.cacheReadPricePerToken }
                    : {}),
                ...(defaultPricing?.cacheWritePricePerToken !== undefined
                    ? { cacheWritePricePerToken: defaultPricing.cacheWritePricePerToken }
                    : {}),
                ...(longContextPricing ? { longContextPricing } : {}),
                capabilityReasoning: false,
                capabilityCode: false,
                ...(supportedEndpoints ? { supportedEndpoints } : {}),
                qualityScore: 3,
            },
        ];
    });
}
const parseOpencodeZen = createModelParser({
    arrayKey: 'data',
    filter: (entry) => typeof entry.id === 'string' && entry.id.length > 0,
    getId: (entry) => `opencode-zen/${entry.id}`,
    getDisplayName: (entry) => entry.id,
});
const MANAGED_FREE_FETCHER_CONFIGS = Object.fromEntries(managed_free_providers_1.MANAGED_FREE_PROVIDER_CONFIGS.map((config) => [
    config.id,
    {
        endpoint: (_key) => (0, managed_free_providers_1.getManagedFreeLiteLlmModelsUrl)(),
        buildHeaders: bearerHeaders,
        parse: (body, provider) => parseManagedFreeLiteLlm(body, provider, config),
    },
]));
exports.PROVIDER_CONFIGS = {
    openai: {
        endpoint: 'https://api.openai.com/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAIDeduped,
    },
    'openai-subscription': {
        endpoint: `https://chatgpt.com/backend-api/codex/models?client_version=${subscription_clients_1.CODEX_CLI_VERSION}`,
        buildHeaders: (key) => ({
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            originator: subscription_clients_1.CODEX_CLI_ORIGINATOR,
            'user-agent': subscription_clients_1.CODEX_CLI_USER_AGENT,
        }),
        parse: parseOpenaiSubscription,
    },
    deepseek: {
        endpoint: 'https://api.deepseek.com/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    byteplus: {
        endpoint: BYTEPLUS_CODING_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseBytePlusCodingPlan,
    },
    commandcode: {
        endpoint: COMMAND_CODE_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseCommandCode,
    },
    cerebras: {
        endpoint: 'https://api.cerebras.ai/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    groq: {
        endpoint: 'https://api.groq.com/openai/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    huggingface: {
        endpoint: HUGGING_FACE_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseHuggingFace,
    },
    fireworks: {
        endpoint: FIREWORKS_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseFireworks,
    },
    kilo: {
        endpoint: `${KILO_GATEWAY_BASE}/models`,
        buildHeaders: bearerHeaders,
        parse: parseKilo,
    },
    mistral: {
        endpoint: 'https://api.mistral.ai/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseMistral,
    },
    'mistral-subscription': {
        endpoint: 'https://api.mistral.ai/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseMistralVibeSubscription,
    },
    moonshot: {
        endpoint: 'https://api.moonshot.ai/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    pioneer: {
        endpoint: PIONEER_MODELS_URL,
        buildHeaders: pioneerHeaders,
        parse: parsePioneer,
    },
    nous: {
        endpoint: NOUS_PORTAL_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseOpenRouter,
    },
    nvidia: {
        endpoint: 'https://integrate.api.nvidia.com/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAIDedupedById,
    },
    xai: {
        endpoint: 'https://api.x.ai/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    minimax: {
        endpoint: `${minimax_oauth_helpers_1.MINIMAX_BASE_URLS.global}/v1/models`,
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    meta: {
        endpoint: META_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseMeta,
    },
    'minimax-subscription': {
        endpoint: MINIMAX_SUBSCRIPTION_MODELS_URL,
        buildHeaders: (key) => ({
            Authorization: `Bearer ${key}`,
            'anthropic-version': '2023-06-01',
        }),
        parse: parseAnthropic,
    },
    xiaomi: {
        endpoint: XIAOMI_MIMO_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseXiaomiMimo,
    },
    'xiaomi-subscription': {
        endpoint: XIAOMI_TOKEN_PLAN_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseXiaomiMimo,
    },
    qwen: {
        endpoint: `${(0, qwen_region_1.getQwenCompatibleBaseUrl)('beijing')}/v1/models`,
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    'qwen-subscription': {
        endpoint: QWEN_TOKEN_PLAN_MODELS_URL,
        buildHeaders: bearerHeaders,
        parse: parseQwenTokenPlan,
    },
    zai: {
        endpoint: 'https://open.bigmodel.cn/api/paas/v4/models',
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    'zai-subscription': {
        endpoint: `${(0, zai_region_1.getZaiCodingPlanBaseUrl)('global')}/models`,
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    anthropic: {
        endpoint: 'https://api.anthropic.com/v1/models?limit=100',
        buildHeaders: (key, authType) => {
            const headers = {
                'anthropic-version': '2023-06-01',
            };
            if (authType === 'subscription') {
                return (0, subscription_clients_1.buildClaudeCodeSubscriptionHeaders)(key);
            }
            else {
                headers['x-api-key'] = key;
            }
            return headers;
        },
        parse: parseAnthropic,
    },
    bedrock: {
        endpoint: `${(0, bedrock_region_1.getBedrockMantleBaseUrl)()}/v1/models`,
        buildHeaders: bearerHeaders,
        parse: parseOpenAI,
    },
    gemini: {
        endpoint: (key) => `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
        buildHeaders: () => ({}),
        parse: parseGemini,
    },
    openrouter: {
        endpoint: 'https://openrouter.ai/api/v1/models',
        buildHeaders: () => ({}),
        parse: parseOpenRouter,
    },
    ...MANAGED_FREE_FETCHER_CONFIGS,
    ollama: {
        endpoint: `${ollama_1.OLLAMA_HOST}/api/tags`,
        buildHeaders: () => ({}),
        parse: parseOllama,
    },
    'ollama-cloud': {
        endpoint: `${ollama_1.OLLAMA_CLOUD_HOST}/api/tags`,
        buildHeaders: bearerHeaders,
        parse: parseOllama,
    },
    copilot: {
        endpoint: 'https://api.githubcopilot.com/models',
        buildHeaders: (key) => ({
            Authorization: `Bearer ${key}`,
            Accept: 'application/json',
            'Editor-Version': subscription_clients_1.COPILOT_EDITOR_VERSION,
            'Editor-Plugin-Version': subscription_clients_1.COPILOT_PLUGIN_VERSION,
            'Copilot-Integration-Id': 'vscode-chat',
        }),
        parse: parseCopilot,
    },
    'opencode-zen': {
        endpoint: 'https://opencode.ai/zen/v1/models',
        buildHeaders: bearerHeaders,
        parse: parseOpencodeZen,
    },
};
const OPENCODE_GO_CONTEXT_WINDOW = 200000;
let ProviderModelFetcherService = ProviderModelFetcherService_1 = class ProviderModelFetcherService {
    opencodeGoCatalog;
    logger = new common_1.Logger(ProviderModelFetcherService_1.name);
    constructor(opencodeGoCatalog = null) {
        this.opencodeGoCatalog = opencodeGoCatalog;
    }
    async fetch(providerId, apiKey, authType, endpointOverride, options) {
        let configKey = providerId.toLowerCase();
        if (configKey === 'openai' && authType === 'subscription') {
            configKey = 'openai-subscription';
        }
        else if (configKey === 'minimax' && authType === 'subscription') {
            configKey = 'minimax-subscription';
        }
        else if (configKey === 'mistral' && authType === 'subscription') {
            configKey = 'mistral-subscription';
        }
        else if (configKey === 'xiaomi' && authType === 'subscription') {
            configKey = 'xiaomi-subscription';
        }
        else if (configKey === 'moonshot' && authType === 'subscription') {
            return [];
        }
        else if (configKey === 'qwen' && authType === 'subscription') {
            configKey = 'qwen-subscription';
        }
        else if (configKey === 'zai' && authType === 'subscription') {
            configKey = 'zai-subscription';
        }
        else if (configKey === 'opencode-go') {
            return this.fetchOpencodeGoModels(apiKey, options?.forceRefresh === true);
        }
        else if (configKey === 'cline-pass') {
            return this.fetchClinePassKnownModels();
        }
        else if (configKey === 'gemini' && authType === 'subscription') {
            return [];
        }
        else if (configKey === 'kiro') {
            return this.fetchKiroModels(apiKey);
        }
        const config = exports.PROVIDER_CONFIGS[configKey];
        if (!config) {
            this.logger.warn(`No fetcher config for provider: ${providerId}`);
            return [];
        }
        if (configKey === 'fireworks') {
            return this.fetchFireworksModels(config, apiKey, providerId);
        }
        if (configKey === 'pioneer') {
            return this.fetchPioneerModels(config, apiKey, providerId, authType);
        }
        let url = typeof config.endpoint === 'function' ? config.endpoint(apiKey) : config.endpoint;
        if (endpointOverride && configKey === 'minimax') {
            const minimaxBaseUrl = (0, provider_base_url_1.normalizeProviderBaseUrl)(endpointOverride);
            if (minimaxBaseUrl === minimax_oauth_helpers_1.MINIMAX_BASE_URLS.global || minimaxBaseUrl === minimax_oauth_helpers_1.MINIMAX_BASE_URLS.cn) {
                url = `${minimaxBaseUrl}/v1/models`;
            }
        }
        else if (endpointOverride && configKey === 'minimax-subscription') {
            const minimaxBaseUrl = (0, provider_base_url_1.normalizeMinimaxSubscriptionBaseUrl)(endpointOverride);
            if (minimaxBaseUrl) {
                url = `${minimaxBaseUrl}/models?limit=100`;
            }
            else {
                this.logger.warn('Ignoring invalid MiniMax subscription endpoint override');
            }
        }
        else if (endpointOverride && configKey === 'bedrock') {
            const bedrockBaseUrl = (0, bedrock_region_1.normalizeBedrockMantleBaseUrl)(endpointOverride);
            if (bedrockBaseUrl) {
                url = `${bedrockBaseUrl}/v1/models`;
            }
            else {
                this.logger.warn('Ignoring invalid AWS Bedrock endpoint override');
            }
        }
        else if (endpointOverride && (configKey === 'qwen' || configKey === 'qwen-subscription')) {
            const qwenBaseUrl = (0, qwen_region_1.normalizeQwenCompatibleBaseUrl)(endpointOverride);
            if (qwenBaseUrl) {
                url = `${qwenBaseUrl}/v1/models`;
            }
            else {
                this.logger.warn('Ignoring invalid Qwen endpoint override');
            }
        }
        else if (endpointOverride && configKey === 'zai-subscription') {
            const zaiBaseUrl = (0, zai_region_1.normalizeZaiCodingPlanBaseUrl)(endpointOverride);
            if (zaiBaseUrl) {
                url = `${zaiBaseUrl}/models`;
            }
            else {
                this.logger.warn('Ignoring invalid Z.ai subscription endpoint override');
            }
        }
        else if (endpointOverride && configKey === 'xiaomi-subscription') {
            const xiaomiBaseUrl = (0, xiaomi_region_1.normalizeXiaomiTokenPlanBaseUrl)(endpointOverride);
            if (xiaomiBaseUrl) {
                url = `${xiaomiBaseUrl}/v1/models`;
            }
            else {
                this.logger.warn('Ignoring invalid Xiaomi MiMo Token Plan endpoint override');
            }
        }
        const headers = config.buildHeaders(apiKey, authType);
        if (configKey === 'bedrock') {
            const region = new URL(url).hostname.split('.')[1];
            const [mantleModels, crisProfiles] = await Promise.all([
                this.fetchModelList(url, headers, config, apiKey, providerId, configKey),
                this.fetchBedrockCrisProfiles(apiKey, region, providerId, options?.previousModels ?? []),
            ]);
            if (mantleModels.length === 0)
                return [];
            const mantleIds = new Set(mantleModels.map((model) => model.id));
            return [...mantleModels, ...crisProfiles.filter((profile) => !mantleIds.has(profile.id))];
        }
        return this.fetchModelList(url, headers, config, apiKey, providerId, configKey);
    }
    async fetchModelList(url, headers, config, apiKey, providerId, configKey) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
            const res = await fetch(url, {
                headers,
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!res.ok) {
                this.logger.warn(`Provider ${providerId} returned ${res.status} from ${url.replace(apiKey, '***')}`);
                return [];
            }
            const body = await res.json();
            return filterNonChatModels(config.parse(body, providerId), configKey);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to fetch models from ${providerId}: ${message}`);
            return [];
        }
    }
    async fetchBedrockCrisProfiles(apiKey, region, providerId, previousModels) {
        const url = `${(0, bedrock_region_1.getBedrockControlPlaneBaseUrl)(region)}/inference-profiles` +
            '?type=SYSTEM_DEFINED&maxResults=1000';
        try {
            const res = await fetch(url, {
                headers: bearerHeaders(apiKey),
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const body = (await res.json());
            if (body.nextToken) {
                this.logger.warn('Bedrock listed more than 1000 inference profiles; only the first 1000 were checked');
            }
            return parseBedrockCrisProfiles(body, providerId);
        }
        catch (err) {
            const kept = previousModels.filter((model) => isBedrockRuntimeProfile(model.id));
            this.logger.warn(`Could not list Bedrock inference profiles (${String(err)}); ` +
                `kept ${kept.length} from the last discovery`);
            return kept;
        }
    }
    async fetchFireworksModels(config, apiKey, providerId) {
        const headers = config.buildHeaders(apiKey);
        const all = [];
        let pageToken;
        let pageCount = 0;
        const seenPageTokens = new Set();
        try {
            do {
                if (pageToken) {
                    if (seenPageTokens.has(pageToken)) {
                        this.logger.warn(`Stopping Fireworks model pagination after repeated token ${pageToken}`);
                        break;
                    }
                    seenPageTokens.add(pageToken);
                }
                const url = this.buildFireworksModelsUrl(pageToken);
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
                const res = await fetch(url, { headers, signal: controller.signal });
                clearTimeout(timeout);
                pageCount += 1;
                if (!res.ok) {
                    this.logger.warn(`Provider ${providerId} returned ${res.status} from ${url}`);
                    return [];
                }
                const body = await res.json();
                all.push(...config.parse(body, providerId));
                const nextPageToken = body?.nextPageToken;
                pageToken =
                    typeof nextPageToken === 'string' && nextPageToken.length > 0 ? nextPageToken : undefined;
                if (pageToken && pageCount >= FIREWORKS_MODELS_MAX_PAGES) {
                    this.logger.warn(`Stopping Fireworks model pagination after ${FIREWORKS_MODELS_MAX_PAGES} pages`);
                    pageToken = undefined;
                }
            } while (pageToken);
            return filterNonChatModels(all, 'fireworks');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to fetch models from ${providerId}: ${message}`);
            return [];
        }
    }
    buildFireworksModelsUrl(pageToken) {
        const params = new URLSearchParams({
            filter: 'supports_serverless=true',
            pageSize: String(FIREWORKS_MODELS_PAGE_SIZE),
        });
        if (pageToken)
            params.set('pageToken', pageToken);
        return `${FIREWORKS_MODELS_URL}?${params.toString()}`;
    }
    async fetchPioneerModels(config, apiKey, providerId, authType) {
        const headers = config.buildHeaders(apiKey, authType);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
            const res = await fetch(PIONEER_MODELS_URL, {
                headers,
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!res.ok) {
                this.logger.warn(`Provider ${providerId} returned ${res.status} from ${PIONEER_MODELS_URL}`);
                return [];
            }
            const models = config.parse(await res.json(), providerId);
            const catalog = await this.fetchPioneerBaseCatalog();
            return filterNonChatModels(enrichPioneerModels(models, catalog), 'pioneer');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to fetch models from ${providerId}: ${message}`);
            return [];
        }
    }
    async fetchPioneerBaseCatalog() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(PIONEER_BASE_MODELS_URL, { signal: controller.signal });
            if (!res.ok) {
                this.logger.warn(`Pioneer base model catalog returned ${res.status}`);
                return new Map();
            }
            return parsePioneerBaseCatalog(await res.json());
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to fetch Pioneer base model catalog: ${message}`);
            return new Map();
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async fetchOpencodeGoModels(apiKey, forceRefresh = false) {
        const live = await this.fetchOpencodeGoLiveModels(apiKey);
        if (live.length > 0)
            return live;
        return this.fetchOpencodeGoDocsCatalog(forceRefresh);
    }
    async fetchOpencodeGoLiveModels(apiKey) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(OPENCODE_GO_MODELS_URL, {
                headers: apiKey ? bearerHeaders(apiKey) : {},
                signal: controller.signal,
            });
            if (!res.ok) {
                this.logger.warn(`OpenCode Go returned ${res.status} from ${OPENCODE_GO_MODELS_URL}`);
                return [];
            }
            const body = await res.json();
            const models = parseOpenAI(body, 'opencode-go').map((model) => {
                const id = `opencode-go/${model.id}`;
                return {
                    ...model,
                    id,
                    displayName: id,
                    provider: 'opencode-go',
                    contextWindow: OPENCODE_GO_CONTEXT_WINDOW,
                    inputPricePerToken: 0,
                    outputPricePerToken: 0,
                    capabilityReasoning: true,
                    capabilityCode: true,
                };
            });
            return filterNonChatModels(models, 'opencode-go');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to fetch OpenCode Go models: ${message}`);
            return [];
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async fetchOpencodeGoDocsCatalog(forceRefresh = false) {
        if (!this.opencodeGoCatalog)
            return [];
        const entries = forceRefresh
            ? await this.opencodeGoCatalog.refresh()
            : await this.opencodeGoCatalog.list();
        return entries.map((entry) => ({
            id: `opencode-go/${entry.id}`,
            displayName: entry.displayName,
            provider: 'opencode-go',
            contextWindow: OPENCODE_GO_CONTEXT_WINDOW,
            inputPricePerToken: 0,
            outputPricePerToken: 0,
            capabilityReasoning: true,
            capabilityCode: true,
            qualityScore: 3,
        }));
    }
    async fetchKiroModels(apiKey) {
        const models = [];
        let nextToken;
        try {
            for (let page = 0; page < 10; page += 1) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
                let res;
                try {
                    res = await fetch(kiro_adapter_1.KIRO_BASE_URL, {
                        method: 'POST',
                        headers: (0, kiro_adapter_1.buildKiroHeaders)(apiKey, kiro_adapter_1.KIRO_MODELS_TARGET),
                        body: JSON.stringify({
                            origin: 'KIRO_CLI',
                            maxResults: 100,
                            ...(nextToken ? { nextToken } : {}),
                        }),
                        signal: controller.signal,
                    });
                }
                finally {
                    clearTimeout(timeout);
                }
                if (!res.ok) {
                    this.logger.warn(`Provider kiro returned ${res.status} from ${kiro_adapter_1.KIRO_BASE_URL}`);
                    return [];
                }
                const body = await res.json();
                models.push(...(0, kiro_adapter_1.parseKiroModels)(body, 'kiro'));
                const maybeNextToken = body.nextToken;
                const snakeNextToken = body.next_token;
                nextToken =
                    typeof maybeNextToken === 'string'
                        ? maybeNextToken
                        : typeof snakeNextToken === 'string'
                            ? snakeNextToken
                            : undefined;
                if (!nextToken)
                    break;
            }
            return filterNonChatModels(models, 'kiro');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to fetch models from kiro: ${message}`);
            return [];
        }
    }
    fetchClinePassKnownModels() {
        const known = (0, manifest_shared_1.getSubscriptionKnownModels)('cline-pass') ?? [];
        const contextWindow = (0, manifest_shared_1.getSubscriptionCapabilities)('cline-pass')?.maxContextWindow ?? model_fetcher_1.DEFAULT_CONTEXT_WINDOW;
        return known.map((id) => ({
            id,
            displayName: id,
            provider: 'cline-pass',
            contextWindow,
            inputPricePerToken: null,
            outputPricePerToken: null,
            capabilityReasoning: true,
            capabilityCode: true,
            qualityScore: 3,
        }));
    }
};
exports.ProviderModelFetcherService = ProviderModelFetcherService;
exports.ProviderModelFetcherService = ProviderModelFetcherService = ProviderModelFetcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(opencode_go_catalog_service_1.OpencodeGoCatalogService)),
    __metadata("design:paramtypes", [Object])
], ProviderModelFetcherService);
//# sourceMappingURL=provider-model-fetcher.service.js.map