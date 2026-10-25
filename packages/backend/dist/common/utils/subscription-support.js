"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedSubscriptionProvider = isSupportedSubscriptionProvider;
exports.isManifestUsableProvider = isManifestUsableProvider;
const manifest_shared_1 = require("manifest-shared");
function isSupportedSubscriptionProvider(provider) {
    return (0, manifest_shared_1.supportsSubscriptionProvider)(provider);
}
function isManifestUsableProvider(record) {
    return record.auth_type !== 'subscription' || isSupportedSubscriptionProvider(record.provider);
}
//# sourceMappingURL=subscription-support.js.map