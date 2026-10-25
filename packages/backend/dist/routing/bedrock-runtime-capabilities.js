"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BEDROCK_RUNTIME_CLAUDE_MESSAGES_MODELS = exports.BEDROCK_RUNTIME_CAPABILITY_CATALOG = void 0;
exports.getBedrockRuntimeCapabilities = getBedrockRuntimeCapabilities;
exports.isBedrockRuntimeClaudeProfile = isBedrockRuntimeClaudeProfile;
exports.getBedrockRuntimeSupportedEndpoints = getBedrockRuntimeSupportedEndpoints;
const bedrock_region_1 = require("./bedrock-region");
const AWS_MODEL_CARDS = 'https://docs.aws.amazon.com/bedrock/latest/userguide';
const VERIFIED_AT = '2026-09-28';
const CHAT_AND_RESPONSES = ['chat_completions', 'responses'];
exports.BEDROCK_RUNTIME_CAPABILITY_CATALOG = [
    {
        modelId: 'moonshotai.kimi-k3',
        apis: CHAT_AND_RESPONSES,
        chatTokenParameter: 'max_tokens',
        sourceUrl: `${AWS_MODEL_CARDS}/model-card-moonshot-ai-kimi-k3.html`,
        verifiedAt: VERIFIED_AT,
    },
    {
        modelId: 'openai.gpt-6-astra',
        apis: CHAT_AND_RESPONSES,
        chatTokenParameter: 'max_completion_tokens',
        sourceUrl: `${AWS_MODEL_CARDS}/model-card-openai-gpt-6-astra.html`,
        verifiedAt: VERIFIED_AT,
    },
    {
        modelId: 'openai.gpt-6-sol',
        apis: CHAT_AND_RESPONSES,
        chatTokenParameter: 'max_completion_tokens',
        sourceUrl: `${AWS_MODEL_CARDS}/model-card-openai-gpt-6-sol.html`,
        verifiedAt: VERIFIED_AT,
    },
    {
        modelId: 'openai.gpt-6-luna',
        apis: CHAT_AND_RESPONSES,
        chatTokenParameter: 'max_completion_tokens',
        sourceUrl: `${AWS_MODEL_CARDS}/model-card-openai-gpt-6-luna.html`,
        verifiedAt: VERIFIED_AT,
    },
    {
        modelId: 'openai.gpt-5.6-luna',
        apis: CHAT_AND_RESPONSES,
        chatTokenParameter: 'max_completion_tokens',
        sourceUrl: `${AWS_MODEL_CARDS}/model-card-openai-gpt-56-luna.html`,
        verifiedAt: VERIFIED_AT,
    },
];
const CATALOG_BY_MODEL_ID = new Map(exports.BEDROCK_RUNTIME_CAPABILITY_CATALOG.map((entry) => [entry.modelId, entry]));
exports.BEDROCK_RUNTIME_CLAUDE_MESSAGES_MODELS = [
    { modelId: 'anthropic.claude-sonnet-5', verifiedAt: '2026-10-01' },
    { modelId: 'anthropic.claude-sonnet-5-5', verifiedAt: '2026-10-01' },
    { modelId: 'anthropic.claude-opus-4-7', verifiedAt: '2026-10-01' },
    { modelId: 'anthropic.claude-opus-4-8', verifiedAt: '2026-10-01' },
    { modelId: 'anthropic.claude-opus-5', verifiedAt: '2026-10-01' },
    { modelId: 'anthropic.claude-opus-5-5', verifiedAt: '2026-10-01' },
    { modelId: 'anthropic.claude-haiku-4-5-20251001-v1:0', verifiedAt: '2026-10-01' },
    { modelId: 'anthropic.claude-haiku-5-5', verifiedAt: '2026-10-09' },
];
const CLAUDE_MESSAGES_MODEL_IDS = new Set(exports.BEDROCK_RUNTIME_CLAUDE_MESSAGES_MODELS.map((entry) => entry.modelId));
const MANIFEST_ENDPOINT_BY_API = {
    chat_completions: '/v1/chat/completions',
    responses: '/v1/responses',
};
const CLAUDE_PROFILE_ENDPOINTS = ['/v1/chat/completions', '/v1/messages'];
function getBedrockRuntimeCapabilities(model) {
    const baseModelId = (0, bedrock_region_1.getBedrockInferenceProfileBaseModelId)(model);
    return baseModelId === null ? null : (CATALOG_BY_MODEL_ID.get(baseModelId) ?? null);
}
function isBedrockRuntimeClaudeProfile(model) {
    const baseModelId = (0, bedrock_region_1.getBedrockInferenceProfileBaseModelId)(model);
    return baseModelId !== null && CLAUDE_MESSAGES_MODEL_IDS.has(baseModelId);
}
function getBedrockRuntimeSupportedEndpoints(model) {
    if (isBedrockRuntimeClaudeProfile(model))
        return [...CLAUDE_PROFILE_ENDPOINTS];
    return (getBedrockRuntimeCapabilities(model)?.apis.map((api) => MANIFEST_ENDPOINT_BY_API[api]) ?? []);
}
//# sourceMappingURL=bedrock-runtime-capabilities.js.map