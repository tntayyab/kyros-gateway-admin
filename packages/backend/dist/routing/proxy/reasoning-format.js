"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportsReasoningContent = supportsReasoningContent;
exports.getOpenAiReasoningStreamFormat = getOpenAiReasoningStreamFormat;
exports.normalizeOpenAiReasoningDelta = normalizeOpenAiReasoningDelta;
const STANDARD_OPENAI_REASONING_STREAM_FORMAT = Object.freeze({
    outputStreamDeltaPaths: Object.freeze(['reasoning_content']),
    clientStreamDeltaPath: 'reasoning_content',
});
const COPILOT_REASONING_STREAM_FORMAT = Object.freeze({
    outputStreamDeltaPaths: Object.freeze(['reasoning_content', 'reasoning_text']),
    clientStreamDeltaPath: 'reasoning_content',
});
const REASONING_CONTENT_AWARE_ENDPOINTS = new Set([
    'openrouter',
    'opencode-go',
    'opencode-zen',
    'custom',
]);
const REASONING_MODEL_FAMILY_RE = /^(?:deepseek|kimi|glm|qwen|minimax|mimo)(?:[-_.\d]|$)/i;
const TRANSLATED_DIALECT_FAMILY_RE = /^(?:claude|gpt|o\d|gemini|grok)(?:[-_.\d]|$)/i;
const UNSAFE_PATH_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);
function supportsReasoningContent(endpointKey, model, catalog) {
    const normalizedEndpoint = endpointKey.toLowerCase();
    const key = normalizedEndpoint.startsWith('custom:') ? 'custom' : normalizedEndpoint;
    if (key === 'deepseek')
        return true;
    if (key === 'moonshot')
        return true;
    if (!REASONING_CONTENT_AWARE_ENDPOINTS.has(key))
        return false;
    const bare = model.toLowerCase().split('/').pop() ?? '';
    if (TRANSLATED_DIALECT_FAMILY_RE.test(bare))
        return false;
    const catalogued = catalog?.isReasoningModel(endpointKey, model);
    if (catalogued !== undefined)
        return catalogued;
    if (key === 'openrouter' && model.toLowerCase().startsWith('moonshotai/')) {
        return true;
    }
    if (key === 'openrouter')
        return bare.includes('deepseek');
    return REASONING_MODEL_FAMILY_RE.test(bare);
}
function getOpenAiReasoningStreamFormat(endpointKey, model, catalog) {
    const normalizedEndpoint = endpointKey.toLowerCase();
    const key = normalizedEndpoint.startsWith('custom:') ? 'custom' : normalizedEndpoint;
    if (key === 'copilot')
        return COPILOT_REASONING_STREAM_FORMAT;
    if (supportsReasoningContent(endpointKey, model, catalog)) {
        return STANDARD_OPENAI_REASONING_STREAM_FORMAT;
    }
    return null;
}
function normalizeOpenAiReasoningDelta(delta, format) {
    const reasoning = firstStringAtPaths(delta, format.outputStreamDeltaPaths);
    if (!reasoning)
        return null;
    const existingClientValue = getClientStreamDelta(delta, format.clientStreamDeltaPath);
    if (typeof existingClientValue === 'string' && existingClientValue.length > 0) {
        return { text: reasoning, normalized: false };
    }
    const normalized = setClientStreamDelta(delta, format.clientStreamDeltaPath, reasoning);
    return { text: reasoning, normalized };
}
function firstStringAtPaths(obj, paths) {
    for (const path of paths) {
        const value = getPath(obj, path);
        if (typeof value === 'string' && value.length > 0)
            return value;
    }
    return null;
}
function getPath(obj, path) {
    const segments = safePathSegments(path);
    if (!segments)
        return undefined;
    let current = obj;
    for (const segment of segments) {
        if (!current || typeof current !== 'object' || Array.isArray(current))
            return undefined;
        current = current[segment];
    }
    return current;
}
function safePathSegments(path) {
    const segments = path.split('.');
    if (segments.some((segment) => !segment || UNSAFE_PATH_SEGMENTS.has(segment)))
        return null;
    return segments;
}
function getClientStreamDelta(obj, path) {
    if (path !== 'reasoning_content')
        return undefined;
    return obj.reasoning_content;
}
function setClientStreamDelta(obj, path, value) {
    if (path !== 'reasoning_content')
        return false;
    obj.reasoning_content = value;
    return true;
}
//# sourceMappingURL=reasoning-format.js.map