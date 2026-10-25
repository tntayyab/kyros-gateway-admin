"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_ENDPOINTS = void 0;
exports.resolveBedrockEndpointKey = resolveBedrockEndpointKey;
exports.buildCustomEndpoint = buildCustomEndpoint;
exports.buildEndpointOverride = buildEndpointOverride;
exports.resolveEndpointKey = resolveEndpointKey;
const managed_free_providers_1 = require("../../common/constants/managed-free-providers");
const ollama_1 = require("../../common/constants/ollama");
const openai_models_1 = require("../../common/constants/openai-models");
const providers_1 = require("../../common/constants/providers");
const subscription_clients_1 = require("../../common/constants/subscription-clients");
const provider_base_url_1 = require("../provider-base-url");
const bedrock_region_1 = require("../bedrock-region");
const bedrock_runtime_capabilities_1 = require("../bedrock-runtime-capabilities");
const qwen_region_1 = require("../qwen-region");
const xiaomi_region_1 = require("../xiaomi-region");
const zai_region_1 = require("../zai-region");
const kiro_adapter_1 = require("./kiro-adapter");
const openaiStreamUsage = { streamUsageReporting: 'openai_stream_options' };
const openaiHeaders = (apiKey) => ({
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
});
const pioneerHeaders = (apiKey) => ({
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
});
const openaiPath = () => '/v1/chat/completions';
const BEDROCK_OPENAI_MODEL_RE = /(?:^|\.)openai\./i;
const BEDROCK_NAMESPACED_GPT_MODEL_RE = /(?:^|\.)openai\.gpt-[5-9](?:[.-]|$)/i;
const BEDROCK_ANTHROPIC_MODEL_RE = /(?:^|\.)anthropic\./i;
const bedrockResponsesPath = (model) => BEDROCK_NAMESPACED_GPT_MODEL_RE.test((0, openai_models_1.stripVendorPrefix)(model))
    ? '/openai/v1/responses'
    : '/v1/responses';
function resolveBedrockEndpointKey(model, apiMode) {
    if ((0, bedrock_region_1.getBedrockInferenceProfileBaseModelId)(model)?.startsWith('anthropic.')) {
        return 'bedrock-runtime-anthropic';
    }
    if ((0, bedrock_runtime_capabilities_1.getBedrockRuntimeCapabilities)(model)) {
        return apiMode === 'responses' ? 'bedrock-runtime-responses' : 'bedrock-runtime';
    }
    const bareModel = (0, openai_models_1.stripVendorPrefix)(model);
    if (BEDROCK_OPENAI_MODEL_RE.test(bareModel))
        return 'bedrock-responses';
    if (BEDROCK_ANTHROPIC_MODEL_RE.test(bareModel))
        return 'bedrock-anthropic';
    return 'bedrock';
}
const anthropicHeaders = (apiKey, authType) => {
    if (authType === 'subscription') {
        return (0, subscription_clients_1.buildClaudeCodeSubscriptionHeaders)(apiKey);
    }
    const headers = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
    };
    headers['x-api-key'] = apiKey;
    return headers;
};
const anthropicBearerHeaders = (apiKey) => ({
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
});
const anthropicApiKeyHeaders = (apiKey) => ({
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
});
const CHATGPT_SUBSCRIPTION_BASE = 'https://chatgpt.com/backend-api';
const BYTEPLUS_CODING_BASE = 'https://ark.ap-southeast.bytepluses.com/api/coding';
const COMMAND_CODE_PROVIDER_BASE = 'https://api.commandcode.ai/provider';
const KIMI_CODING_SUBSCRIPTION_BASE = 'https://api.kimi.com/coding';
const MINIMAX_SUBSCRIPTION_BASE = 'https://api.minimax.io/anthropic/v1';
const XIAOMI_MIMO_BASE = 'https://api.xiaomimimo.com';
const XIAOMI_TOKEN_PLAN_BASE = (0, xiaomi_region_1.getXiaomiTokenPlanBaseUrl)();
const QWEN_TOKEN_PLAN_BASE = 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode';
const ZAI_SUBSCRIPTION_BASE = (0, zai_region_1.getZaiCodingPlanBaseUrl)('global');
const OPENCODE_GO_BASE = 'https://opencode.ai/zen/go';
const OPENCODE_ZEN_BASE = 'https://opencode.ai/zen';
const KILO_GATEWAY_BASE = 'https://api.kilo.ai/api/gateway';
const NOUS_PORTAL_BASE = 'https://inference-api.nousresearch.com';
const NVIDIA_NIM_BASE = 'https://integrate.api.nvidia.com';
const FIREWORKS_INFERENCE_BASE = 'https://api.fireworks.ai/inference';
const HUGGING_FACE_INFERENCE_BASE = 'https://router.huggingface.co';
const PIONEER_BASE = 'https://api.pioneer.ai';
const META_BASE = 'https://api.meta.ai';
const chatgptSubscriptionHeaders = (apiKey) => ({
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    originator: subscription_clients_1.CODEX_CLI_ORIGINATOR,
    'user-agent': subscription_clients_1.CODEX_CLI_USER_AGENT,
});
const MANAGED_FREE_ENDPOINTS = Object.fromEntries(managed_free_providers_1.MANAGED_FREE_PROVIDER_CONFIGS.map((config) => [
    config.id,
    {
        get baseUrl() {
            return (0, managed_free_providers_1.getManagedFreeLiteLlmBaseUrl)();
        },
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
]));
exports.PROVIDER_ENDPOINTS = {
    openai: {
        baseUrl: 'https://api.openai.com',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'openai-subscription': {
        baseUrl: CHATGPT_SUBSCRIPTION_BASE,
        buildHeaders: chatgptSubscriptionHeaders,
        buildPath: () => '/codex/responses',
        format: 'chatgpt',
    },
    'openai-responses': {
        baseUrl: 'https://api.openai.com',
        buildHeaders: openaiHeaders,
        buildPath: () => '/v1/responses',
        format: 'chatgpt',
    },
    anthropic: {
        baseUrl: 'https://api.anthropic.com',
        buildHeaders: anthropicHeaders,
        buildPath: () => '/v1/messages',
        format: 'anthropic',
    },
    bedrock: {
        baseUrl: (0, bedrock_region_1.getBedrockMantleBaseUrl)(),
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'bedrock-responses': {
        baseUrl: (0, bedrock_region_1.getBedrockMantleBaseUrl)(),
        buildHeaders: openaiHeaders,
        buildPath: bedrockResponsesPath,
        format: 'chatgpt',
        forwardResponsesStream: true,
        acceptsMaxOutputTokens: true,
    },
    'bedrock-runtime': {
        baseUrl: (0, bedrock_region_1.getBedrockRuntimeBaseUrl)(),
        buildHeaders: openaiHeaders,
        buildPath: () => '/openai/v1/chat/completions',
        format: 'openai',
        acceptsPromptCacheKey: true,
        ...openaiStreamUsage,
    },
    'bedrock-runtime-responses': {
        baseUrl: (0, bedrock_region_1.getBedrockRuntimeBaseUrl)(),
        buildHeaders: openaiHeaders,
        buildPath: () => '/openai/v1/responses',
        format: 'chatgpt',
        forwardResponsesStream: true,
        acceptsMaxOutputTokens: true,
        acceptsPromptCacheKey: true,
    },
    'bedrock-anthropic': {
        baseUrl: (0, bedrock_region_1.getBedrockMantleBaseUrl)(),
        buildHeaders: anthropicApiKeyHeaders,
        buildPath: () => '/anthropic/v1/messages',
        format: 'anthropic',
        skipSubscriptionIdentity: true,
    },
    'bedrock-runtime-anthropic': {
        baseUrl: (0, bedrock_region_1.getBedrockRuntimeBaseUrl)(),
        buildHeaders: anthropicApiKeyHeaders,
        buildPath: () => '/anthropic/v1/messages',
        format: 'anthropic',
        skipSubscriptionIdentity: true,
    },
    deepseek: {
        baseUrl: 'https://api.deepseek.com',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    byteplus: {
        baseUrl: BYTEPLUS_CODING_BASE,
        buildHeaders: openaiHeaders,
        buildPath: () => '/v3/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    'byteplus-anthropic': {
        baseUrl: BYTEPLUS_CODING_BASE,
        buildHeaders: anthropicBearerHeaders,
        buildPath: () => '/v1/messages',
        format: 'anthropic',
        skipSubscriptionIdentity: true,
    },
    commandcode: {
        baseUrl: COMMAND_CODE_PROVIDER_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    cerebras: {
        baseUrl: 'https://api.cerebras.ai',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'cline-pass': {
        baseUrl: 'https://api.cline.bot',
        buildHeaders: openaiHeaders,
        buildPath: () => '/api/v1/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    pioneer: {
        baseUrl: PIONEER_BASE,
        buildHeaders: pioneerHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'commandcode-anthropic': {
        baseUrl: COMMAND_CODE_PROVIDER_BASE,
        buildHeaders: anthropicApiKeyHeaders,
        buildPath: () => '/v1/messages',
        format: 'anthropic',
        skipSubscriptionIdentity: true,
    },
    fireworks: {
        baseUrl: FIREWORKS_INFERENCE_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
    },
    groq: {
        baseUrl: 'https://api.groq.com/openai',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    huggingface: {
        baseUrl: HUGGING_FACE_INFERENCE_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    kilo: {
        baseUrl: KILO_GATEWAY_BASE,
        buildHeaders: openaiHeaders,
        buildPath: () => '/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    mistral: {
        baseUrl: 'https://api.mistral.ai',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    nous: {
        baseUrl: NOUS_PORTAL_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    xai: {
        baseUrl: 'https://api.x.ai',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'xai-responses': {
        baseUrl: 'https://api.x.ai',
        buildHeaders: openaiHeaders,
        buildPath: () => '/v1/responses',
        format: 'chatgpt',
    },
    minimax: {
        baseUrl: 'https://api.minimax.io',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    meta: {
        baseUrl: META_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'minimax-subscription': {
        baseUrl: MINIMAX_SUBSCRIPTION_BASE,
        buildHeaders: anthropicBearerHeaders,
        buildPath: () => '/messages',
        format: 'anthropic',
    },
    xiaomi: {
        baseUrl: XIAOMI_MIMO_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'xiaomi-subscription': {
        baseUrl: XIAOMI_TOKEN_PLAN_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    moonshot: {
        baseUrl: 'https://api.moonshot.ai',
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'moonshot-subscription': {
        baseUrl: KIMI_CODING_SUBSCRIPTION_BASE,
        buildHeaders: anthropicApiKeyHeaders,
        buildPath: () => '/v1/messages',
        format: 'anthropic',
        skipSubscriptionIdentity: true,
    },
    nvidia: {
        baseUrl: NVIDIA_NIM_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    qwen: {
        baseUrl: (0, qwen_region_1.getQwenCompatibleBaseUrl)('beijing'),
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'qwen-subscription': {
        baseUrl: QWEN_TOKEN_PLAN_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'qwen-subscription-responses': {
        baseUrl: QWEN_TOKEN_PLAN_BASE,
        buildHeaders: openaiHeaders,
        buildPath: () => '/v1/responses',
        format: 'chatgpt',
    },
    zai: {
        baseUrl: 'https://api.z.ai',
        buildHeaders: openaiHeaders,
        buildPath: () => '/api/paas/v4/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    'zai-subscription': {
        baseUrl: ZAI_SUBSCRIPTION_BASE,
        buildHeaders: openaiHeaders,
        buildPath: () => '/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    google: {
        baseUrl: 'https://generativelanguage.googleapis.com',
        buildHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        }),
        buildPath: (model) => `/v1beta/models/${model}:generateContent`,
        buildStreamPath: (model) => `/v1beta/models/${model}:streamGenerateContent`,
        format: 'google',
    },
    vertex: {
        baseUrl: 'https://aiplatform.googleapis.com/v1beta1',
        buildHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        }),
        buildPath: (model) => `/publishers/google/models/${model}:generateContent`,
        buildStreamPath: (model) => `/publishers/google/models/${model}:streamGenerateContent`,
        format: 'google',
    },
    'gemini-subscription': {
        baseUrl: 'https://cloudcode-pa.googleapis.com',
        buildHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        }),
        buildPath: () => '/v1internal:generateContent',
        buildStreamPath: () => '/v1internal:streamGenerateContent',
        format: 'google',
        codeAssistEnvelope: true,
    },
    copilot: {
        baseUrl: 'https://api.githubcopilot.com',
        buildHeaders: (apiKey) => ({
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Editor-Version': subscription_clients_1.COPILOT_EDITOR_VERSION,
            'Editor-Plugin-Version': subscription_clients_1.COPILOT_PLUGIN_VERSION,
            'Copilot-Integration-Id': 'vscode-chat',
        }),
        buildPath: () => '/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    'copilot-responses': {
        baseUrl: 'https://api.githubcopilot.com',
        buildHeaders: (apiKey) => ({
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Editor-Version': subscription_clients_1.COPILOT_EDITOR_VERSION,
            'Editor-Plugin-Version': subscription_clients_1.COPILOT_PLUGIN_VERSION,
            'Copilot-Integration-Id': 'vscode-chat',
        }),
        buildPath: () => '/responses',
        format: 'chatgpt',
    },
    openrouter: {
        baseUrl: 'https://openrouter.ai',
        buildHeaders: (apiKey) => ({
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://manifest.build',
            'X-Title': 'Manifest',
        }),
        buildPath: () => '/api/v1/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    ...MANAGED_FREE_ENDPOINTS,
    ollama: {
        baseUrl: ollama_1.OLLAMA_HOST,
        buildHeaders: () => ({ 'Content-Type': 'application/json' }),
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'ollama-cloud': {
        baseUrl: ollama_1.OLLAMA_CLOUD_HOST,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    kiro: {
        baseUrl: kiro_adapter_1.KIRO_BASE_URL,
        buildHeaders: (apiKey) => (0, kiro_adapter_1.buildKiroHeaders)(apiKey, kiro_adapter_1.KIRO_CHAT_TARGET),
        buildPath: () => '/',
        format: 'kiro',
    },
    'opencode-go': {
        baseUrl: OPENCODE_GO_BASE,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
    },
    'opencode-go-anthropic': {
        baseUrl: OPENCODE_GO_BASE,
        buildHeaders: anthropicApiKeyHeaders,
        buildPath: () => '/v1/messages',
        format: 'anthropic',
    },
    'opencode-go-responses': {
        baseUrl: OPENCODE_GO_BASE,
        buildHeaders: openaiHeaders,
        buildPath: () => '/v1/responses',
        format: 'chatgpt',
        forwardResponsesStream: true,
        acceptsMaxOutputTokens: true,
    },
    'opencode-zen': {
        baseUrl: OPENCODE_ZEN_BASE,
        buildHeaders: openaiHeaders,
        buildPath: () => '/v1/chat/completions',
        format: 'openai',
        ...openaiStreamUsage,
    },
    'opencode-zen-google': {
        baseUrl: OPENCODE_ZEN_BASE,
        buildHeaders: (apiKey) => ({
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json',
        }),
        buildPath: (model) => `/v1/models/${model}:generateContent`,
        format: 'google',
    },
};
function buildCustomEndpoint(baseUrl, apiKind = 'openai') {
    const normalized = (0, provider_base_url_1.normalizeProviderBaseUrl)(baseUrl);
    if (apiKind === 'anthropic') {
        return {
            baseUrl: normalized,
            buildHeaders: anthropicHeaders,
            buildPath: () => '/v1/messages',
            format: 'anthropic',
            requiresSsrfRevalidation: true,
        };
    }
    return {
        baseUrl: normalized,
        buildHeaders: openaiHeaders,
        buildPath: openaiPath,
        format: 'openai',
        ...openaiStreamUsage,
        requiresSsrfRevalidation: true,
    };
}
function buildEndpointOverride(baseUrl, templateKey) {
    const template = exports.PROVIDER_ENDPOINTS[templateKey];
    if (!template) {
        throw new Error(`No provider endpoint template configured for: ${templateKey}`);
    }
    return {
        ...template,
        baseUrl: templateKey === 'minimax-subscription'
            ? baseUrl.replace(/\/+$/, '')
            : (0, provider_base_url_1.normalizeProviderBaseUrl)(baseUrl),
        requiresSsrfRevalidation: true,
    };
}
function resolveEndpointKey(provider) {
    const lower = provider.toLowerCase();
    if (exports.PROVIDER_ENDPOINTS[lower])
        return lower;
    if (lower.startsWith('custom:'))
        return lower;
    const entry = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(lower);
    if (entry) {
        if (exports.PROVIDER_ENDPOINTS[entry.id])
            return entry.id;
        for (const alias of entry.aliases) {
            if (exports.PROVIDER_ENDPOINTS[alias])
                return alias;
        }
    }
    return null;
}
//# sourceMappingURL=provider-endpoints.js.map