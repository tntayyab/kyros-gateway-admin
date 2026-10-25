"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_VARIANT_RE = void 0;
exports.stripGoogleVariant = stripGoogleVariant;
exports.stripProviderPrefix = stripProviderPrefix;
exports.stripDateSuffix = stripDateSuffix;
exports.buildAliasMap = buildAliasMap;
exports.normalizeDots = normalizeDots;
exports.resolveModelName = resolveModelName;
const anthropic_model_id_1 = require("../common/utils/anthropic-model-id");
const providers_1 = require("../common/constants/providers");
const KNOWN_ALIASES = [
    ['claude-opus-4', 'claude-opus-4-6'],
    ['claude-sonnet-4.5', 'claude-sonnet-4-5-20250929'],
    ['claude-sonnet-4-5', 'claude-sonnet-4-5-20250929'],
    ['claude-opus-4-5', 'claude-opus-4-5-20251101'],
    ['claude-opus-4-1', 'claude-opus-4-1-20250805'],
    ['claude-sonnet-4-0', 'claude-sonnet-4-20250514'],
    ['claude-opus-4-0', 'claude-opus-4-20250514'],
    ['claude-sonnet-4', 'claude-sonnet-4-20250514'],
    ['claude-haiku-4.5', 'claude-haiku-4-5-20251001'],
    ['claude-haiku-4-5', 'claude-haiku-4-5-20251001'],
    ['deepseek-v3', 'deepseek-chat'],
    ['deepseek-chat-v3-0324', 'deepseek-chat'],
    ['deepseek-r1', 'deepseek-reasoner'],
    ['MiniMax-M2.7', 'minimax-m2.7'],
    ['MiniMax-M2.7-highspeed', 'minimax-m2.7-highspeed'],
    ['MiniMax-M2.5', 'minimax-m2.5'],
    ['MiniMax-M2.5-highspeed', 'minimax-m2.5-highspeed'],
    ['MiniMax-M2.1', 'minimax-m2.1'],
    ['MiniMax-M2.1-highspeed', 'minimax-m2.1-highspeed'],
    ['MiniMax-M2', 'minimax-m2'],
    ['MiniMax-M1', 'minimax-m1'],
    ['mistral-large', 'mistral-large-latest'],
    ['codestral', 'codestral-latest'],
];
const EXTRA_INGEST_PREFIXES = ['accounts/fireworks/models/', 'amazon/', 'fireworks/', 'together/'];
const PROVIDER_PREFIXES = [
    ...EXTRA_INGEST_PREFIXES,
    ...[...providers_1.OPENROUTER_PREFIX_TO_PROVIDER.keys()].map((p) => `${p}/`),
];
const DATE_SUFFIX_RE = /-\d{4}-?\d{2}-?\d{2}$/;
const VERSION_SUFFIX_RE = /-\d{3}$/;
exports.GOOGLE_VARIANT_RE = /-(?:preview(?:-\d{2,4}){1,3}|exp-\d{4}|latest)$/;
function stripGoogleVariant(name) {
    return name.replace(exports.GOOGLE_VARIANT_RE, '');
}
function stripProviderPrefix(name) {
    for (const prefix of PROVIDER_PREFIXES) {
        if (name.startsWith(prefix)) {
            return name.slice(prefix.length);
        }
    }
    return name;
}
function stripDateSuffix(name) {
    return name.replace(DATE_SUFFIX_RE, '');
}
function buildAliasMap(canonicalNames) {
    const map = new Map();
    for (const name of canonicalNames) {
        map.set(name, name);
        for (const variant of (0, anthropic_model_id_1.buildAnthropicShortModelIdVariants)(name)) {
            if (!map.has(variant)) {
                map.set(variant, name);
            }
        }
        const bare = stripProviderPrefix(name);
        if (bare !== name && !map.has(bare)) {
            map.set(bare, name);
        }
        const bareNoVersion = bare.replace(VERSION_SUFFIX_RE, '');
        if (bareNoVersion !== bare && !map.has(bareNoVersion)) {
            map.set(bareNoVersion, name);
        }
        const bareNoVariant = stripGoogleVariant(bare);
        if (bareNoVariant !== bare && !map.has(bareNoVariant)) {
            map.set(bareNoVariant, name);
        }
        for (const variant of (0, anthropic_model_id_1.buildAnthropicShortModelIdVariants)(bare)) {
            if (!map.has(variant)) {
                map.set(variant, name);
            }
        }
    }
    for (const [alias, canonical] of KNOWN_ALIASES) {
        if (map.has(alias))
            continue;
        const resolved = map.get(canonical) ?? canonical;
        map.set(alias, resolved);
    }
    return map;
}
function normalizeDots(name) {
    return name.replace(/\./g, '-');
}
function resolveModelName(name, aliasMap) {
    const exact = aliasMap.get(name);
    if (exact)
        return exact;
    const stripped = stripProviderPrefix(name);
    const fromStripped = aliasMap.get(stripped);
    if (fromStripped)
        return fromStripped;
    const noDate = stripDateSuffix(stripped);
    if (noDate !== stripped) {
        const fromNoDate = aliasMap.get(noDate);
        if (fromNoDate)
            return fromNoDate;
    }
    const noVariant = stripGoogleVariant(stripped);
    if (noVariant !== stripped) {
        const fromNoVariant = aliasMap.get(noVariant);
        if (fromNoVariant)
            return fromNoVariant;
    }
    const dotNorm = normalizeDots(stripped);
    if (dotNorm !== stripped) {
        const fromDotNorm = aliasMap.get(dotNorm);
        if (fromDotNorm)
            return fromDotNorm;
        const dotNormNoDate = stripDateSuffix(dotNorm);
        if (dotNormNoDate !== dotNorm) {
            const fromDotNormNoDate = aliasMap.get(dotNormNoDate);
            if (fromDotNormNoDate)
                return fromDotNormNoDate;
        }
    }
    return undefined;
}
//# sourceMappingURL=model-name-normalizer.js.map