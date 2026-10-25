"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUD_LOCAL_PROVIDER_MESSAGE = void 0;
exports.isLocalOnlyProvider = isLocalOnlyProvider;
exports.isProviderAvailableForDeployment = isProviderAvailableForDeployment;
exports.filterProvidersForDeployment = filterProvidersForDeployment;
const manifest_shared_1 = require("manifest-shared");
const detect_self_hosted_1 = require("./detect-self-hosted");
exports.CLOUD_LOCAL_PROVIDER_MESSAGE = 'Built-in local providers are only available in self-hosted Manifest. On Manifest Cloud, expose the runtime through a public URL or tunnel and connect it as a custom provider.';
function isLocalOnlyProvider(provider) {
    const lower = provider.trim().toLowerCase();
    const entry = manifest_shared_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get(lower) ??
        manifest_shared_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get((0, manifest_shared_1.normalizeProviderName)(lower));
    return entry?.localOnly === true;
}
function isProviderAvailableForDeployment(provider) {
    return (0, detect_self_hosted_1.isSelfHosted)() || !isLocalOnlyProvider(provider);
}
function filterProvidersForDeployment(providers) {
    if ((0, detect_self_hosted_1.isSelfHosted)() || !providers.some((provider) => isLocalOnlyProvider(provider.provider))) {
        return providers;
    }
    return providers.filter((provider) => !isLocalOnlyProvider(provider.provider));
}
//# sourceMappingURL=provider-availability.js.map