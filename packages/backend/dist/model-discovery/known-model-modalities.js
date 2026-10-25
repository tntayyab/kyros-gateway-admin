"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupKnownModalities = lookupKnownModalities;
const TEXT_IMAGE_TOOLS = {
    input: ['text', 'image'],
    output: ['text'],
    capabilities: ['text', 'image', 'tools', 'stream'],
};
const TEXT_IMAGE_VIDEO_TOOLS = {
    input: ['text', 'image', 'video'],
    output: ['text'],
    capabilities: ['text', 'image', 'video', 'tools', 'stream'],
};
const TEXT_TOOLS = {
    input: ['text'],
    output: ['text'],
    capabilities: ['text', 'tools', 'stream'],
};
const KNOWN_MODEL_MODALITIES = {
    'openai/gpt-5.6-sol': TEXT_IMAGE_TOOLS,
    'openai/gpt-5.6-terra': TEXT_IMAGE_TOOLS,
    'openai/gpt-5.6-luna': TEXT_IMAGE_TOOLS,
    'openai/gpt-5.5': TEXT_IMAGE_TOOLS,
    'openai/gpt-5.4': TEXT_IMAGE_TOOLS,
    'openai/gpt-5.4-mini': TEXT_IMAGE_TOOLS,
    'openai/gpt-5.3-codex-spark': TEXT_TOOLS,
    'moonshot/k3': TEXT_IMAGE_VIDEO_TOOLS,
    'moonshot/k3-256k': TEXT_IMAGE_TOOLS,
    'moonshot/kimi-for-coding': TEXT_IMAGE_VIDEO_TOOLS,
    'moonshot/kimi-for-coding-highspeed': TEXT_IMAGE_VIDEO_TOOLS,
};
function lookupKnownModalities(providerId, modelId) {
    return KNOWN_MODEL_MODALITIES[`${providerId.toLowerCase()}/${modelId.toLowerCase()}`];
}
//# sourceMappingURL=known-model-modalities.js.map