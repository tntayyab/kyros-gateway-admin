"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataIdentities = metadataIdentities;
exports.resolveMetadataEntry = resolveMetadataEntry;
const manifest_shared_1 = require("manifest-shared");
function metadataIdentities(provider, modelId) {
    const primary = (0, manifest_shared_1.resolveProviderMetadataIdentity)(provider, modelId);
    const bare = (0, manifest_shared_1.underlyingGatewayModel)(modelId);
    if (bare === null)
        return [primary];
    if ((primary.provider ?? provider) === provider && primary.model === bare)
        return [primary];
    return [primary, { provider, model: bare }];
}
function resolveMetadataEntry(provider, modelId, lookup) {
    const candidates = metadataIdentities(provider, modelId);
    for (const metadata of candidates) {
        const entry = lookup(metadata.provider ?? provider, metadata.model);
        if (entry != null)
            return { metadata, entry };
    }
    return { metadata: candidates[0], entry: null };
}
//# sourceMappingURL=metadata-identity.js.map