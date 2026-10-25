"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionOpenAiModelId = exports.openAiModelId = exports.SUBSCRIPTION_MODEL_SUFFIX = exports.OPENAI_MODEL_ID_AUTO = void 0;
exports.routeForOpenAiModelId = routeForOpenAiModelId;
exports.explicitModelRouteCandidate = explicitModelRouteCandidate;
const manifest_shared_1 = require("manifest-shared");
const route_helpers_1 = require("../routing-core/route-helpers");
const public_model_id_1 = require("../routing-core/public-model-id");
var public_model_id_2 = require("../routing-core/public-model-id");
Object.defineProperty(exports, "OPENAI_MODEL_ID_AUTO", { enumerable: true, get: function () { return public_model_id_2.OPENAI_MODEL_ID_AUTO; } });
Object.defineProperty(exports, "SUBSCRIPTION_MODEL_SUFFIX", { enumerable: true, get: function () { return public_model_id_2.SUBSCRIPTION_MODEL_SUFFIX; } });
Object.defineProperty(exports, "openAiModelId", { enumerable: true, get: function () { return public_model_id_2.openAiModelId; } });
Object.defineProperty(exports, "subscriptionOpenAiModelId", { enumerable: true, get: function () { return public_model_id_2.subscriptionOpenAiModelId; } });
function routeForOpenAiModelId(modelId, models) {
    for (const model of models) {
        if (!model.authType)
            continue;
        if ((0, public_model_id_1.openAiModelId)(model) !== modelId)
            continue;
        return {
            provider: model.provider,
            authType: model.authType,
            model: model.id,
        };
    }
    return (0, route_helpers_1.unambiguousRoute)(modelId, [...models]);
}
function explicitModelRouteCandidate(modelId) {
    if (modelId.startsWith('custom:')) {
        const slashIndex = modelId.indexOf('/');
        if (slashIndex <= 0)
            return null;
        return {
            provider: modelId.slice(0, slashIndex),
            model: modelId,
            providerQualified: true,
        };
    }
    const slashIndex = modelId.indexOf('/');
    if (slashIndex > 0 && slashIndex < modelId.length - 1) {
        return {
            provider: modelId.slice(0, slashIndex).toLowerCase(),
            model: modelId.slice(slashIndex + 1),
            providerQualified: true,
        };
    }
    const provider = (0, manifest_shared_1.inferProviderFromModel)(modelId);
    return provider ? { provider, model: modelId, providerQualified: false } : null;
}
//# sourceMappingURL=openai-model-id.js.map