"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_MODEL_SUFFIX = exports.OPENAI_MODEL_ID_AUTO = void 0;
exports.subscriptionOpenAiModelId = subscriptionOpenAiModelId;
exports.openAiModelId = openAiModelId;
exports.OPENAI_MODEL_ID_AUTO = 'auto';
exports.SUBSCRIPTION_MODEL_SUFFIX = '-subscription';
function subscriptionOpenAiModelId(provider, modelId) {
    const normalizedProvider = provider.toLowerCase();
    if (modelId === exports.OPENAI_MODEL_ID_AUTO || normalizedProvider.startsWith('custom:'))
        return modelId;
    const prefix = `${normalizedProvider}/`;
    const routeId = modelId.toLowerCase().startsWith(prefix)
        ? modelId
        : `${normalizedProvider}/${modelId}`;
    return routeId.endsWith(exports.SUBSCRIPTION_MODEL_SUFFIX)
        ? routeId
        : `${routeId}${exports.SUBSCRIPTION_MODEL_SUFFIX}`;
}
function customOpenAiModelId(model) {
    if (!model.providerAlias)
        return model.id;
    const prefix = `${model.provider}/`;
    const modelName = model.id.startsWith(prefix) ? model.id.slice(prefix.length) : model.id;
    return `${model.providerAlias}/${modelName}`;
}
function openAiModelId(model) {
    const provider = model.provider.toLowerCase();
    if (provider.startsWith('custom:'))
        return customOpenAiModelId(model);
    const prefix = `${provider}/`;
    const routeId = model.id.toLowerCase().startsWith(prefix) ? model.id : `${provider}/${model.id}`;
    return model.authType === 'subscription'
        ? subscriptionOpenAiModelId(provider, model.id)
        : routeId;
}
//# sourceMappingURL=public-model-id.js.map