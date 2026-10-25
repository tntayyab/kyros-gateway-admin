"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModalities = parseModalities;
exports.mergeModelCapabilities = mergeModelCapabilities;
exports.modelModalitiesFromModelsDev = modelModalitiesFromModelsDev;
exports.inputModalitiesFromCapabilities = inputModalitiesFromCapabilities;
exports.capabilitiesFromModelsDev = capabilitiesFromModelsDev;
exports.resolveModelCapabilityMetadata = resolveModelCapabilityMetadata;
exports.modelSupportsStreaming = modelSupportsStreaming;
const providers_1 = require("../common/constants/providers");
const metadata_identity_1 = require("./metadata-identity");
const manifest_shared_1 = require("manifest-shared");
const known_model_modalities_1 = require("./known-model-modalities");
const DEFAULT_MODALITIES = ['text'];
const STREAMING_ENDPOINT_PROVIDERS = new Set([
    'anthropic',
    'byteplus',
    'commandcode',
    'copilot',
    'deepseek',
    'fireworks',
    'gemini',
    'groq',
    'huggingface',
    'minimax',
    'mistral',
    'moonshot',
    'nvidia',
    'ollama',
    'ollama-cloud',
    'openai',
    'opencode-go',
    'opencode-zen',
    'openrouter',
    'qwen',
    'xai',
    'xiaomi',
    'zai',
]);
function parseModalities(value) {
    if (!Array.isArray(value))
        return undefined;
    const upstream = new Set(value
        .filter((entry) => typeof entry === 'string')
        .map((entry) => entry.toLowerCase()));
    const modalities = manifest_shared_1.MODEL_MODALITIES.filter((modality) => upstream.has(modality));
    return modalities.length > 0 ? modalities : undefined;
}
function mergeModelCapabilities(...capabilityLists) {
    const merged = [];
    const seen = new Set();
    for (const capabilities of capabilityLists) {
        for (const capability of capabilities ?? []) {
            if (seen.has(capability))
                continue;
            seen.add(capability);
            merged.push(capability);
        }
    }
    return merged.length > 0 ? merged : undefined;
}
function modelModalitiesFromModelsDev(modalities) {
    return {
        input: normalizeModalities(modalities?.input),
        output: normalizeModalities(modalities?.output),
    };
}
function inputModalitiesFromCapabilities(capabilities) {
    const out = ['text'];
    for (const capability of capabilities ?? []) {
        if (capability === 'text' || capability === 'stream' || capability === 'tools')
            continue;
        if (!out.includes(capability))
            out.push(capability);
    }
    return out;
}
function capabilitiesFromModelsDev(providerId, modelId, modalities, toolCall) {
    const out = [];
    const add = (capability) => {
        if (!out.includes(capability))
            out.push(capability);
    };
    const normalized = modelModalitiesFromModelsDev(modalities);
    for (const modality of [...normalized.input, ...normalized.output])
        add(modality);
    if (toolCall === true)
        add('tools');
    if (modelSupportsStreaming(providerId, modelId))
        add('stream');
    return out;
}
async function resolveModelCapabilityMetadata(model, paramSpecs, modelsDevSync) {
    const specCapabilities = await paramSpecs.getCapabilities(model.provider, model.authType ?? 'api_key', model.id);
    const { metadata, entry: modelsDevEntry } = (0, metadata_identity_1.resolveMetadataEntry)(model.provider, model.id, (providerId, modelId) => modelsDevSync.lookupModelCapabilities(providerId, modelId));
    const metadataProvider = metadata.provider ?? model.provider;
    const known = (0, known_model_modalities_1.lookupKnownModalities)(metadataProvider, metadata.model);
    return {
        capabilities: mergeModelCapabilities(model.capabilities, modelsDevEntry?.capabilities, specCapabilities, modelSupportsStreaming(metadataProvider, metadata.model) ? ['stream'] : undefined, known?.capabilities),
        inputModalities: model.inputModalities ?? modelsDevEntry?.inputModalities ?? known?.input,
        outputModalities: model.outputModalities ?? modelsDevEntry?.outputModalities ?? known?.output,
        modelsDevEntry,
    };
}
function modelSupportsStreaming(providerId, modelId) {
    const provider = resolveProviderId(providerId);
    if (provider.startsWith('custom:'))
        return true;
    if (!STREAMING_ENDPOINT_PROVIDERS.has(provider))
        return false;
    if (provider === 'openai' && isOpenAiNonStreamingModel(modelId))
        return false;
    return true;
}
function resolveProviderId(providerId) {
    const lower = providerId.toLowerCase();
    const entry = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(lower);
    return entry?.id ?? lower;
}
function normalizeModalities(values) {
    return parseModalities(values) ?? DEFAULT_MODALITIES;
}
function isOpenAiNonStreamingModel(modelId) {
    const lower = modelId.toLowerCase();
    return (lower.includes('image') ||
        lower.includes('tts') ||
        lower.includes('whisper') ||
        lower.includes('transcribe') ||
        lower.includes('embedding'));
}
//# sourceMappingURL=model-capabilities.js.map