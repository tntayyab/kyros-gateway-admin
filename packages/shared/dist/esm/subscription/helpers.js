import { SUBSCRIPTION_PROVIDER_CONFIGS } from './configs';
import { normalizeProviderName, SHARED_PROVIDER_BY_ID_OR_ALIAS } from '../providers';
function normalizeProviderId(providerId) {
    const lower = String(providerId || '')
        .trim()
        .toLowerCase();
    const entry = SHARED_PROVIDER_BY_ID_OR_ALIAS.get(lower) ??
        SHARED_PROVIDER_BY_ID_OR_ALIAS.get(normalizeProviderName(lower));
    return entry?.id ?? lower;
}
export function getSubscriptionProviderConfig(providerId) {
    return (SUBSCRIPTION_PROVIDER_CONFIGS[normalizeProviderId(providerId)] ?? null);
}
export function supportsSubscriptionProvider(providerId) {
    return getSubscriptionProviderConfig(providerId) !== null;
}
export function getSubscriptionKnownModels(providerId) {
    const config = getSubscriptionProviderConfig(providerId);
    return config?.knownModels ?? null;
}
export function getSubscriptionKnownModelsMatch(providerId) {
    const config = getSubscriptionProviderConfig(providerId);
    return config?.knownModelsMatch ?? 'prefix';
}
export function getSubscriptionCapabilities(providerId) {
    const config = getSubscriptionProviderConfig(providerId);
    return config?.subscriptionCapabilities ?? null;
}
//# sourceMappingURL=helpers.js.map