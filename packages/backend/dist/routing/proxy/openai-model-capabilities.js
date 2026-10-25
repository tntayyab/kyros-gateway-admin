"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAiModelCapabilities = openAiModelCapabilities;
const FEATURE_CAPABILITIES = ['stream', 'tools'];
function openAiModelCapabilities(model) {
    const out = {};
    if (model.inputModalities?.length)
        out.input_modalities = model.inputModalities;
    if (model.outputModalities?.length)
        out.output_modalities = model.outputModalities;
    const features = model.capabilities?.filter((capability) => FEATURE_CAPABILITIES.includes(capability));
    if (features?.length)
        out.features = features;
    if (model.supportedEndpoints?.length)
        out.supported_endpoints = model.supportedEndpoints;
    return Object.keys(out).length > 0 ? out : undefined;
}
//# sourceMappingURL=openai-model-capabilities.js.map