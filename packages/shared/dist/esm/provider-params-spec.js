import { resolveUnderlyingModelIdentity, underlyingGatewayModel } from './provider-inference';
import { normalizeProviderName, SHARED_PROVIDER_BY_ID_OR_ALIAS } from './providers';
export const MODEL_MODALITIES = ['text', 'image', 'audio', 'video'];
export const MODEL_CAPABILITIES = [...MODEL_MODALITIES, 'stream', 'tools'];
const GROUP_ORDER = [
    'generation_length',
    'sampling',
    'reasoning',
    'tooling',
    'output_format',
    'observability',
    'provider_metadata',
];
const UNSAFE_PATH_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);
export function normalizeProviderParamProviderId(providerId) {
    const lower = providerId.toLowerCase();
    const exact = SHARED_PROVIDER_BY_ID_OR_ALIAS.get(lower);
    if (exact)
        return exact.id;
    const normalized = SHARED_PROVIDER_BY_ID_OR_ALIAS.get(normalizeProviderName(lower));
    if (normalized)
        return normalized.id;
    return lower;
}
/**
 * Resolve the catalog lookup identity for a model.
 *
 * Gateways (e.g. OpenCode Go) are transparent transports: a model like
 * `opencode-go/deepseek-v4-pro` exposes the underlying provider's native
 * parameters, so it resolves to `(deepseek, api_key, deepseek-v4-pro)`. The
 * gateway's own subscription billing is irrelevant to which knobs the
 * model's API accepts, so authType collapses to `api_key`. Non-gateway ids
 * are returned unchanged.
 */
function paramLookupIdentity(providerId, authType, model) {
    if (!model || underlyingGatewayModel(model) === null)
        return { providerId, authType, model };
    const resolved = resolveUnderlyingModelIdentity(providerId, model);
    return { providerId: resolved.provider, authType: 'api_key', model: resolved.model };
}
export function getProviderParamSpecs(catalog, providerId, authType, model) {
    const id = paramLookupIdentity(providerId, authType, model);
    if (!id.providerId || !id.authType || !id.model)
        return [];
    const provider = normalizeProviderParamProviderId(id.providerId);
    const entry = catalog.find((spec) => normalizeProviderParamProviderId(spec.provider) === provider &&
        spec.authType === id.authType &&
        spec.model === id.model);
    if (!entry)
        return [];
    return entry.params
        .map((param) => {
        const provider = normalizeProviderParamProviderId(entry.provider);
        return {
            provider,
            authType: entry.authType,
            model: entry.model,
            ...param,
        };
    })
        .sort(compareProviderParamSpecs);
}
export function getProviderModelCapabilities(catalog, providerId, authType, model) {
    const id = paramLookupIdentity(providerId, authType, model);
    if (!id.providerId || !id.authType || !id.model)
        return null;
    const provider = normalizeProviderParamProviderId(id.providerId);
    const entry = catalog.find((spec) => normalizeProviderParamProviderId(spec.provider) === provider &&
        spec.authType === id.authType &&
        spec.model === id.model);
    return entry?.capabilities ?? null;
}
export function compareProviderParamSpecs(a, b) {
    const groupDelta = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
    if (groupDelta !== 0)
        return groupDelta;
    const rootDelta = pathRoot(a.path).localeCompare(pathRoot(b.path));
    if (rootDelta !== 0)
        return rootDelta;
    const pathKindDelta = pathOrderRank(a.path) - pathOrderRank(b.path);
    if (pathKindDelta !== 0)
        return pathKindDelta;
    return a.path.localeCompare(b.path);
}
export function providerParamIsApplicable(spec, values) {
    const applicability = spec.applicability;
    if (applicability) {
        if (applicability.only && !matchesRule(applicability.only, values))
            return false;
        if (applicability.except && matchesRule(applicability.except, values))
            return false;
    }
    return true;
}
export function isParamApplicability(value) {
    if (!isRecord(value))
        return false;
    const keys = Object.keys(value);
    if (keys.length === 0 || keys.some((key) => key !== 'only' && key !== 'except'))
        return false;
    const applicability = value;
    if (applicability.only !== undefined && !isApplicabilityRule(applicability.only))
        return false;
    if (applicability.except !== undefined && !isApplicabilityRule(applicability.except)) {
        return false;
    }
    return true;
}
export function isProviderParamPath(path) {
    const segments = path.split('.');
    return (segments.length > 0 &&
        segments.every((segment) => segment !== '' && !UNSAFE_PATH_SEGMENTS.has(segment)));
}
export function pickProviderCompatibleParams(params, specs) {
    const expanded = expandConfiguredParamDefaults(params, specs);
    const out = {};
    for (const spec of specs) {
        if (!hasPath(expanded, spec.path))
            continue;
        if (!providerParamIsApplicable(spec, expanded))
            continue;
        setPath(out, spec.path, getPath(expanded, spec.path));
    }
    return out;
}
export function providerParamValueIsValid(spec, value) {
    if (spec.type === 'boolean')
        return typeof value === 'boolean';
    if (spec.type === 'string')
        return typeof value === 'string';
    if (spec.type === 'enum') {
        return (spec.values ?? []).some((candidate) => jsonValuesEqual(value, candidate));
    }
    if (spec.type === 'integer')
        return numberValueIsValid(spec, value, Number.isInteger);
    if (spec.type === 'number')
        return numberValueIsValid(spec, value);
    return false;
}
export function omitProviderInapplicableParams(params, specs) {
    let out = null;
    for (const spec of specs) {
        if (!hasPath(params, spec.path))
            continue;
        if (providerParamIsApplicable(spec, params))
            continue;
        out ??= structuredCloneRecord(params);
        deletePath(out, spec.path);
    }
    return (out ?? params);
}
/**
 * Fill missing sibling defaults when a nested param object is configured.
 * Example: saving `thinking.type=enabled` also needs the applicable
 * `thinking.budget_tokens` default so the provider receives a complete
 * thinking object.
 */
export function expandConfiguredParamDefaults(params, specs) {
    const out = structuredCloneRecord(params);
    const configuredRoots = new Set(Object.keys(out).filter((key) => isRecord(out[key]) && specs.some((s) => pathRoot(s.path) === key)));
    if (configuredRoots.size === 0)
        return out;
    for (const spec of specs) {
        if (!configuredRoots.has(pathRoot(spec.path)))
            continue;
        if (hasPath(out, spec.path))
            continue;
        if (!providerParamIsApplicable(spec, out))
            continue;
        if (spec.default === undefined)
            continue;
        setPath(out, spec.path, spec.default);
    }
    return out;
}
export function getProviderParamValue(values, path) {
    if (!values)
        return undefined;
    return getPath(values, path);
}
export function setProviderParamValue(values, path, value) {
    const next = structuredCloneRecord(values);
    setPath(next, path, value);
    return next;
}
export function deleteProviderParamValue(values, path) {
    const next = structuredCloneRecord(values);
    deletePath(next, path);
    return next;
}
function matchesRule(rule, values) {
    const matches = Array.isArray(rule) ? rule : [rule];
    return matches.some((match) => matchesAll(match, values));
}
function matchesAll(match, values) {
    for (const [path, expected] of Object.entries(match)) {
        const exists = hasPath(values, path);
        const actual = getPath(values, path);
        if (isNotCondition(expected)) {
            if (!exists)
                return false;
            if (matchesValue(expected.not, actual))
                return false;
            continue;
        }
        if (!matchesValue(expected, actual))
            return false;
    }
    return true;
}
function matchesValue(expected, actual) {
    if (expected === undefined)
        return actual === undefined;
    if (Array.isArray(expected)) {
        return expected.some((item) => jsonValuesEqual(actual, item));
    }
    return jsonValuesEqual(actual, expected);
}
function isNotCondition(value) {
    return isRecord(value) && 'not' in value;
}
function isApplicabilityRule(value) {
    if (Array.isArray(value))
        return value.length > 0 && value.every(isApplicabilityMatch);
    return isApplicabilityMatch(value);
}
function isApplicabilityMatch(value) {
    if (!isRecord(value))
        return false;
    const entries = Object.entries(value);
    return (entries.length > 0 &&
        entries.every(([path, expected]) => isProviderParamPath(path) && isMatchValue(expected)));
}
function isMatchValue(value) {
    if (isComparableValue(value))
        return true;
    return isApplicabilityCondition(value);
}
function isApplicabilityCondition(value) {
    if (!isRecord(value))
        return false;
    const keys = Object.keys(value);
    return keys.length === 1 && keys[0] === 'not' && isComparableValue(value.not);
}
function isComparableValue(value) {
    if (isJsonPrimitive(value))
        return true;
    return Array.isArray(value) && value.length > 0 && value.every(isJsonPrimitive);
}
function isJsonPrimitive(value) {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}
function getPath(values, path) {
    let current = values;
    for (const segment of splitProviderParamPath(path)) {
        if (!isRecord(current))
            return undefined;
        if (!hasOwn(current, segment))
            return undefined;
        current = current[segment];
    }
    return current;
}
function hasPath(values, path) {
    let current = values;
    const segments = splitProviderParamPath(path);
    for (let i = 0; i < segments.length; i++) {
        if (!isRecord(current) || !hasOwn(current, segments[i]))
            return false;
        current = current[segments[i]];
    }
    return true;
}
function setPath(values, path, value) {
    const segments = splitProviderParamPath(path);
    let current = values;
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        const existing = hasOwn(current, segment) ? current[segment] : undefined;
        if (!isRecord(existing))
            defineOwn(current, segment, {});
        current = current[segment];
    }
    defineOwn(current, segments[segments.length - 1], value);
}
function deletePath(values, path) {
    const parents = [];
    let current = values;
    const segments = splitProviderParamPath(path);
    for (let i = 0; i < segments.length - 1; i++) {
        if (!isRecord(current) || !hasOwn(current, segments[i]))
            return;
        parents.push([current, segments[i]]);
        current = current[segments[i]];
    }
    if (!isRecord(current))
        return;
    deleteOwn(current, segments[segments.length - 1]);
    for (let i = parents.length - 1; i >= 0; i--) {
        const [parent, segment] = parents[i];
        const child = parent[segment];
        if (isRecord(child) && Object.keys(child).length === 0) {
            deleteOwn(parent, segment);
        }
    }
}
function pathRoot(path) {
    return splitProviderParamPath(path)[0];
}
function pathOrderRank(path) {
    if (path.endsWith('.type'))
        return 0;
    return 1;
}
function jsonValuesEqual(a, b) {
    if (isRecord(a) || isRecord(b) || Array.isArray(a) || Array.isArray(b)) {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
}
function numberValueIsValid(spec, value, predicate = Number.isFinite) {
    if (typeof value !== 'number' || !Number.isFinite(value) || !predicate(value))
        return false;
    if (spec.range?.min !== undefined && value < spec.range.min)
        return false;
    if (spec.range?.max !== undefined && value > spec.range.max)
        return false;
    return true;
}
function structuredCloneRecord(value) {
    return JSON.parse(JSON.stringify(value));
}
function splitProviderParamPath(path) {
    if (!isProviderParamPath(path))
        throw new Error(`Invalid provider param path: ${path}`);
    return path.split('.');
}
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function defineOwn(target, key, value) {
    /* istanbul ignore next -- splitProviderParamPath rejects these; this local guard satisfies CodeQL. */
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new Error(`Invalid provider param path segment: ${key}`);
    }
    Object.defineProperty(target, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
    });
}
function deleteOwn(target, key) {
    /* istanbul ignore next -- splitProviderParamPath rejects these; this local guard satisfies CodeQL. */
    if (key === '__proto__' || key === 'constructor' || key === 'prototype')
        return;
    if (hasOwn(target, key))
        Reflect.deleteProperty(target, key);
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=provider-params-spec.js.map