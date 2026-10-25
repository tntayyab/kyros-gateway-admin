"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionProviderConfig = getSubscriptionProviderConfig;
exports.supportsSubscriptionProvider = supportsSubscriptionProvider;
exports.getSubscriptionKnownModels = getSubscriptionKnownModels;
exports.getSubscriptionKnownModelsMatch = getSubscriptionKnownModelsMatch;
exports.getSubscriptionCapabilities = getSubscriptionCapabilities;
const configs_1 = require("./configs");
const providers_1 = require("../providers");
function normalizeProviderId(providerId) {
    const lower = String(providerId || '')
        .trim()
        .toLowerCase();
    const entry = providers_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get(lower) ??
        providers_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get((0, providers_1.normalizeProviderName)(lower));
    return entry?.id ?? lower;
}
function getSubscriptionProviderConfig(providerId) {
    return (configs_1.SUBSCRIPTION_PROVIDER_CONFIGS[normalizeProviderId(providerId)] ?? null);
}
function supportsSubscriptionProvider(providerId) {
    return getSubscriptionProviderConfig(providerId) !== null;
}
function getSubscriptionKnownModels(providerId) {
    const config = getSubscriptionProviderConfig(providerId);
    return config?.knownModels ?? null;
}
function getSubscriptionKnownModelsMatch(providerId) {
    const config = getSubscriptionProviderConfig(providerId);
    return config?.knownModelsMatch ?? 'prefix';
}
function getSubscriptionCapabilities(providerId) {
    const config = getSubscriptionProviderConfig(providerId);
    return config?.subscriptionCapabilities ?? null;
}
//# sourceMappingURL=helpers.js.map