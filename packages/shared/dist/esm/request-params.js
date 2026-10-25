import { compareProviderParamSpecs, expandConfiguredParamDefaults, omitProviderInapplicableParams, providerParamIsApplicable, setProviderParamValue, } from './provider-params-spec';
/**
 * Merge configured Manifest params into a request body using the route's
 * param specs. Storage stays as UI values. The provider wire shape is the
 * same path shape unless a future provider needs a dedicated transformer.
 */
export function applyRequestParamDefaults(body, defaults, specs) {
    const orderedSpecs = [...specs].sort(compareProviderParamSpecs);
    if (!defaults)
        return omitProviderInapplicableParams(body, orderedSpecs);
    const expanded = expandConfiguredParamDefaults(defaults, orderedSpecs);
    let merged = {};
    for (const spec of orderedSpecs) {
        if (!providerParamIsApplicable(spec, expanded))
            continue;
        if (!hasPath(expanded, spec.path))
            continue;
        merged = setProviderParamValue(merged, spec.path, getPath(expanded, spec.path));
    }
    return omitProviderInapplicableParams(deepMerge(body, merged), orderedSpecs);
}
function deepMerge(base, overrides) {
    const out = structuredCloneRecord(base);
    for (const [key, value] of Object.entries(overrides)) {
        if (isRecord(value) && isRecord(out[key])) {
            out[key] = deepMerge(out[key], value);
        }
        else {
            out[key] = value;
        }
    }
    return out;
}
function getPath(values, path) {
    let current = values;
    for (const segment of path.split('.')) {
        if (!isRecord(current))
            return undefined;
        current = current[segment];
    }
    return current;
}
function hasPath(values, path) {
    let current = values;
    const segments = path.split('.');
    for (let i = 0; i < segments.length; i++) {
        if (!isRecord(current) || !(segments[i] in current))
            return false;
        current = current[segments[i]];
    }
    return true;
}
function structuredCloneRecord(value) {
    return JSON.parse(JSON.stringify(value));
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=request-params.js.map