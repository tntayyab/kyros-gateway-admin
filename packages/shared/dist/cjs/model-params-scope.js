"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelParamsScopeForTier = modelParamsScopeForTier;
exports.modelParamsScopeForSpecificity = modelParamsScopeForSpecificity;
exports.modelParamsScopeForHeaderTier = modelParamsScopeForHeaderTier;
exports.modelParamsScopeForRouting = modelParamsScopeForRouting;
function modelParamsScopeForTier(tier) {
    return `tier:${tier}`;
}
function modelParamsScopeForSpecificity(category) {
    return `specificity:${category}`;
}
function modelParamsScopeForHeaderTier(headerTierId) {
    return `header:${headerTierId}`;
}
function modelParamsScopeForRouting(input) {
    if (input.headerTierId)
        return modelParamsScopeForHeaderTier(input.headerTierId);
    if (input.specificityCategory)
        return modelParamsScopeForSpecificity(input.specificityCategory);
    return modelParamsScopeForTier(input.tier);
}
//# sourceMappingURL=model-params-scope.js.map