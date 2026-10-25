"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectChatGptSseResponse = exports.toResponsesRequest = exports.toAnthropicRequest = exports.toGoogleRequest = exports.extractThinkingBlocksFromMessagesResponse = exports.hasMessageCacheControl = exports.applyAnthropicMessagesMutations = exports.applyAnthropicLastMessageCacheControl = exports.applyAnthropicAutomaticCacheControl = exports.createChatGptStreamTransformer = void 0;
exports.convertChatGptResponse = convertChatGptResponse;
exports.convertGoogleResponse = convertGoogleResponse;
exports.convertGoogleStreamChunk = convertGoogleStreamChunk;
exports.convertAnthropicResponse = convertAnthropicResponse;
exports.convertAnthropicStreamChunk = convertAnthropicStreamChunk;
exports.createAnthropicTransformer = createAnthropicTransformer;
exports.createReasoningContentStreamTransformer = createReasoningContentStreamTransformer;
exports.sanitizeOpenAiBody = sanitizeOpenAiBody;
const google_adapter_1 = require("./google-adapter");
Object.defineProperty(exports, "toGoogleRequest", { enumerable: true, get: function () { return google_adapter_1.toGoogleRequest; } });
const anthropic_adapter_1 = require("./anthropic-adapter");
Object.defineProperty(exports, "applyAnthropicAutomaticCacheControl", { enumerable: true, get: function () { return anthropic_adapter_1.applyAnthropicAutomaticCacheControl; } });
Object.defineProperty(exports, "applyAnthropicLastMessageCacheControl", { enumerable: true, get: function () { return anthropic_adapter_1.applyAnthropicLastMessageCacheControl; } });
Object.defineProperty(exports, "applyAnthropicMessagesMutations", { enumerable: true, get: function () { return anthropic_adapter_1.applyAnthropicMessagesMutations; } });
Object.defineProperty(exports, "hasMessageCacheControl", { enumerable: true, get: function () { return anthropic_adapter_1.hasMessageCacheControl; } });
Object.defineProperty(exports, "extractThinkingBlocksFromMessagesResponse", { enumerable: true, get: function () { return anthropic_adapter_1.extractThinkingBlocksFromMessagesResponse; } });
Object.defineProperty(exports, "toAnthropicRequest", { enumerable: true, get: function () { return anthropic_adapter_1.toAnthropicRequest; } });
const chatgpt_adapter_1 = require("./chatgpt-adapter");
Object.defineProperty(exports, "toResponsesRequest", { enumerable: true, get: function () { return chatgpt_adapter_1.toResponsesRequest; } });
Object.defineProperty(exports, "collectChatGptSseResponse", { enumerable: true, get: function () { return chatgpt_adapter_1.collectChatGptSseResponse; } });
const reasoning_format_1 = require("./reasoning-format");
function convertChatGptResponse(body, model) {
    return (0, chatgpt_adapter_1.fromResponsesResponse)(body, model);
}
var chatgpt_adapter_2 = require("./chatgpt-adapter");
Object.defineProperty(exports, "createChatGptStreamTransformer", { enumerable: true, get: function () { return chatgpt_adapter_2.createChatGptStreamTransformer; } });
function convertGoogleResponse(googleBody, model) {
    return (0, google_adapter_1.fromGoogleResponse)(googleBody, model);
}
function convertGoogleStreamChunk(chunk, model, state) {
    return (0, google_adapter_1.transformGoogleStreamChunk)(chunk, model, state);
}
function convertAnthropicResponse(anthropicBody, model) {
    return (0, anthropic_adapter_1.fromAnthropicResponse)(anthropicBody, model);
}
function convertAnthropicStreamChunk(chunk, model) {
    return (0, anthropic_adapter_1.transformAnthropicStreamChunk)(chunk, model);
}
function createAnthropicTransformer(model, onThinkingBlocks) {
    return (0, anthropic_adapter_1.createAnthropicStreamTransformer)(model, onThinkingBlocks);
}
const PASSTHROUGH_PROVIDERS = new Set(['openai', 'openrouter']);
const OPENAI_ONLY_FIELDS = new Set([
    'store',
    'metadata',
    'service_tier',
    'stream_options',
    'modalities',
    'audio',
    'prediction',
    'reasoning_effort',
]);
const OLLAMA_ENDPOINTS = new Set(['ollama', 'ollama-cloud']);
const MISTRAL_TOOL_CALL_ID_REGEX = /^[A-Za-z0-9]{9}$/;
const NVIDIA_NEMOTRON_FAMILY_RE = /^nemotron(?:[-_.\d]|$)/i;
const OPENAI_MAX_COMPLETION_TOKENS_RE = /^(o\d|gpt-5)/i;
const OPENAI_MAX_COMPLETION_TOKENS_ENDPOINTS = new Set(['openai', 'copilot']);
function usesOpenAiMaxCompletionTokens(endpointKey, bareModel) {
    return (OPENAI_MAX_COMPLETION_TOKENS_ENDPOINTS.has(endpointKey) &&
        OPENAI_MAX_COMPLETION_TOKENS_RE.test(bareModel));
}
function createReasoningContentStreamTransformer(onReasoningContent, format = {
    outputStreamDeltaPaths: ['reasoning_content'],
    clientStreamDeltaPath: 'reasoning_content',
}) {
    let accumulatedReasoning = '';
    let firstToolCallId = null;
    let storedReasoning = '';
    const storeIfReady = () => {
        if (onReasoningContent &&
            accumulatedReasoning &&
            firstToolCallId &&
            accumulatedReasoning !== storedReasoning) {
            onReasoningContent(firstToolCallId, accumulatedReasoning);
            storedReasoning = accumulatedReasoning;
        }
    };
    return (chunk) => {
        let outChunk = chunk;
        try {
            const parsed = JSON.parse(chunk);
            const choice = parsed.choices?.[0];
            const delta = choice?.delta;
            if (delta) {
                const reasoning = (0, reasoning_format_1.normalizeOpenAiReasoningDelta)(delta, format);
                if (reasoning) {
                    accumulatedReasoning += reasoning.text;
                    if (reasoning.normalized)
                        outChunk = JSON.stringify(parsed);
                    storeIfReady();
                }
                const toolCalls = delta.tool_calls;
                if (Array.isArray(toolCalls)) {
                    for (const toolCall of toolCalls) {
                        if (!toolCall || typeof toolCall !== 'object' || Array.isArray(toolCall))
                            continue;
                        if (firstToolCallId === null && typeof toolCall.id === 'string' && toolCall.id) {
                            firstToolCallId = toolCall.id;
                        }
                    }
                    storeIfReady();
                }
            }
            if (choice?.finish_reason === 'tool_calls')
                storeIfReady();
        }
        catch {
        }
        return `data: ${outChunk}\n\n`;
    };
}
function normalizeOpenAiMessages(messages, endpointKey) {
    if (!Array.isArray(messages))
        return messages;
    const isMistral = endpointKey === 'mistral';
    const mistralIdMap = new Map();
    const reservedMistralIds = new Set();
    let generatedMistralIdCounter = 0;
    const reserveMistralToolCallId = (toolCallId) => {
        if (!isMistral || typeof toolCallId !== 'string')
            return;
        if (MISTRAL_TOOL_CALL_ID_REGEX.test(toolCallId)) {
            reservedMistralIds.add(toolCallId);
        }
    };
    if (isMistral) {
        for (const message of messages) {
            if (!message || typeof message !== 'object' || Array.isArray(message)) {
                continue;
            }
            const rawMessage = message;
            if (Array.isArray(rawMessage.tool_calls)) {
                for (const toolCall of rawMessage.tool_calls) {
                    if (!toolCall || typeof toolCall !== 'object' || Array.isArray(toolCall)) {
                        continue;
                    }
                    reserveMistralToolCallId(toolCall.id);
                }
            }
            if ('tool_call_id' in rawMessage) {
                reserveMistralToolCallId(rawMessage.tool_call_id);
            }
        }
    }
    const nextGeneratedMistralId = () => {
        do {
            generatedMistralIdCounter += 1;
            const candidate = `tc${generatedMistralIdCounter.toString(36).padStart(7, '0')}`;
            if (!reservedMistralIds.has(candidate))
                return candidate;
        } while (true);
    };
    const normalizeMistralToolCallId = (toolCallId) => {
        if (!isMistral || typeof toolCallId !== 'string')
            return toolCallId;
        const existing = mistralIdMap.get(toolCallId);
        if (existing)
            return existing;
        if (MISTRAL_TOOL_CALL_ID_REGEX.test(toolCallId)) {
            mistralIdMap.set(toolCallId, toolCallId);
            reservedMistralIds.add(toolCallId);
            return toolCallId;
        }
        const rewritten = nextGeneratedMistralId();
        mistralIdMap.set(toolCallId, rewritten);
        reservedMistralIds.add(rewritten);
        return rewritten;
    };
    return messages.map((message) => {
        if (!message || typeof message !== 'object' || Array.isArray(message)) {
            return message;
        }
        const normalized = { ...message };
        if (endpointKey !== 'openrouter') {
            delete normalized.reasoning;
            delete normalized.reasoning_details;
        }
        delete normalized.reasoning_text;
        if (isMistral && Array.isArray(normalized.tool_calls)) {
            normalized.tool_calls = normalized.tool_calls.map((toolCall) => {
                if (!toolCall || typeof toolCall !== 'object' || Array.isArray(toolCall)) {
                    return toolCall;
                }
                const normalizedToolCall = { ...toolCall };
                normalizedToolCall.id = normalizeMistralToolCallId(normalizedToolCall.id);
                return normalizedToolCall;
            });
        }
        if (isMistral && 'tool_call_id' in normalized) {
            normalized.tool_call_id = normalizeMistralToolCallId(normalized.tool_call_id);
        }
        return normalized;
    });
}
function sanitizeOpenAiBody(body, endpointKey, model, options = {}) {
    const passthroughTopLevel = PASSTHROUGH_PROVIDERS.has(endpointKey);
    const bareForRegex = model.includes('/') ? model.substring(model.indexOf('/') + 1) : model;
    const needsMaxCompletionTokens = options.requireMaxCompletionTokens === true ||
        usesOpenAiMaxCompletionTokens(endpointKey, bareForRegex);
    const convertMaxTokens = needsMaxCompletionTokens && 'max_tokens' in body && !('max_completion_tokens' in body);
    const isOpenRouterNemotron = endpointKey === 'openrouter' && NVIDIA_NEMOTRON_FAMILY_RE.test(bareForRegex);
    const cleaned = {};
    for (const [key, value] of Object.entries(body)) {
        if (key === 'messages') {
            cleaned[key] = normalizeOpenAiMessages(value, endpointKey);
            continue;
        }
        if (convertMaxTokens && key === 'max_tokens') {
            cleaned['max_completion_tokens'] = value;
            continue;
        }
        if (options.requireMaxCompletionTokens && key === 'max_tokens')
            continue;
        if (passthroughTopLevel) {
            if (key === 'thinking' && isOpenRouterNemotron)
                continue;
            cleaned[key] = value;
            continue;
        }
        if (key === 'reasoning_effort' &&
            (endpointKey === 'xai' || endpointKey === 'deepseek' || options.forwardReasoningEffort)) {
            cleaned[key] = value;
            continue;
        }
        if (OPENAI_ONLY_FIELDS.has(key))
            continue;
        if (key === 'thinking' && OLLAMA_ENDPOINTS.has(endpointKey.toLowerCase()))
            continue;
        if (key === 'max_completion_tokens') {
            if (needsMaxCompletionTokens) {
                cleaned[key] = value;
            }
            else if (!('max_tokens' in body)) {
                cleaned['max_tokens'] = value;
            }
            continue;
        }
        cleaned[key] = value;
    }
    if (options.forwardReasoningEffort &&
        cleaned.reasoning_effort === undefined &&
        Array.isArray(cleaned.tools) &&
        cleaned.tools.some((tool) => tool?.type === 'function')) {
        cleaned.reasoning_effort = 'none';
    }
    return cleaned;
}
//# sourceMappingURL=provider-client-converters.js.map