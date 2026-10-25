"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PROVIDER_IDS = exports.OPENROUTER_PREFIX_TO_PROVIDER = exports.PROVIDER_BY_ID_OR_ALIAS = exports.PROVIDER_BY_ID = exports.PROVIDER_REGISTRY = void 0;
exports.expandProviderNames = expandProviderNames;
const manifest_shared_1 = require("manifest-shared");
exports.PROVIDER_REGISTRY = manifest_shared_1.SHARED_PROVIDERS;
exports.PROVIDER_BY_ID = manifest_shared_1.SHARED_PROVIDER_BY_ID;
exports.PROVIDER_BY_ID_OR_ALIAS = manifest_shared_1.SHARED_PROVIDER_BY_ID_OR_ALIAS;
exports.OPENROUTER_PREFIX_TO_PROVIDER = new Map(exports.PROVIDER_REGISTRY.flatMap((p) => p.openRouterPrefixes.map((prefix) => [prefix, p.displayName])));
exports.ALL_PROVIDER_IDS = new Set(exports.PROVIDER_REGISTRY.flatMap((p) => [p.id, ...p.aliases]));
function expandProviderNames(names) {
    const expanded = new Set();
    for (const name of names) {
        const lower = name.toLowerCase();
        expanded.add(lower);
        if (lower.startsWith('custom:'))
            continue;
        const entry = exports.PROVIDER_BY_ID_OR_ALIAS.get(lower);
        if (entry) {
            expanded.add(entry.id);
            for (const alias of entry.aliases)
                expanded.add(alias);
        }
    }
    return expanded;
}
//# sourceMappingURL=providers.js.map