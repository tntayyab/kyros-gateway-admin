export function modelParamsScopeForTier(tier) {
    return `tier:${tier}`;
}
export function modelParamsScopeForSpecificity(category) {
    return `specificity:${category}`;
}
export function modelParamsScopeForHeaderTier(headerTierId) {
    return `header:${headerTierId}`;
}
export function modelParamsScopeForRouting(input) {
    if (input.headerTierId)
        return modelParamsScopeForHeaderTier(input.headerTierId);
    if (input.specificityCategory)
        return modelParamsScopeForSpecificity(input.specificityCategory);
    return modelParamsScopeForTier(input.tier);
}
//# sourceMappingURL=model-params-scope.js.map