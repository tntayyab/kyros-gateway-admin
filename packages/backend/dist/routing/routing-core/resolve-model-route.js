"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesModelName = matchesModelName;
exports.resolveModelRoute = resolveModelRoute;
exports.resolveFallbackRoutes = resolveFallbackRoutes;
exports.describeUnresolvedFallback = describeUnresolvedFallback;
exports.describeUnresolvedModel = describeUnresolvedModel;
const public_model_id_1 = require("./public-model-id");
const route_helpers_1 = require("./route-helpers");
const HINT_LIMIT = 20;
function matchesModelName(model, name) {
    if (model.id === name || (0, public_model_id_1.openAiModelId)(model) === name)
        return true;
    return model.provider.startsWith('custom:') && model.id === `${model.provider}/${name}`;
}
function resolveModelRoute(name, available, scope = {}) {
    const named = available.filter((m) => m.authType && matchesModelName(m, name));
    if (named.length === 0)
        return { ok: false, reason: 'not_found' };
    const provider = scope.provider?.toLowerCase();
    const inProvider = provider ? named.filter((m) => m.provider.toLowerCase() === provider) : named;
    if (inProvider.length === 0)
        return { ok: false, reason: 'wrong_provider' };
    const candidates = scope.authType
        ? inProvider.filter((m) => m.authType === scope.authType)
        : inProvider;
    if (candidates.length === 0)
        return { ok: false, reason: 'wrong_auth_type' };
    const routeKey = (m) => [m.provider.toLowerCase(), m.authType, m.id].join('\u0000');
    if (new Set(candidates.map(routeKey)).size > 1)
        return { ok: false, reason: 'ambiguous' };
    const match = candidates[0];
    const route = {
        provider: match.provider,
        authType: match.authType,
        model: match.id,
    };
    return { ok: true, route: scope.keyLabel ? { ...route, keyLabel: scope.keyLabel } : route };
}
function resolveFallbackRoutes(models, available, routes, storedRoutes) {
    const aligned = routes !== undefined &&
        routes.length === models.length &&
        routes.every((r, i) => r.model === models[i]);
    const fromRoutes = aligned ? resolveGivenRoutes(routes, available, storedRoutes) : null;
    if (fromRoutes)
        return { ok: true, routes: fromRoutes };
    const pool = [...(storedRoutes ?? [])];
    const resolved = [];
    for (const model of models) {
        const kept = pool.findIndex((s) => s.model === model);
        if (kept >= 0) {
            resolved.push(pool.splice(kept, 1)[0]);
            continue;
        }
        const resolution = resolveModelRoute(model, available);
        if (!resolution.ok)
            return { ok: false, model };
        resolved.push(resolution.route);
    }
    return { ok: true, routes: resolved };
}
function resolveGivenRoutes(routes, available, storedRoutes) {
    const pool = [...(storedRoutes ?? [])];
    const resolved = [];
    for (const route of routes) {
        const kept = pool.findIndex((s) => (0, route_helpers_1.routeMatches)(s, route));
        if (kept >= 0) {
            pool.splice(kept, 1);
            resolved.push(route);
            continue;
        }
        const resolution = resolveModelRoute(route.model, available, {
            provider: route.provider,
            authType: route.authType,
            keyLabel: route.keyLabel,
        });
        if (!resolution.ok)
            return null;
        resolved.push(resolution.route);
    }
    return resolved;
}
function describeUnresolvedFallback(model) {
    return (`Cannot resolve fallback model "${model}" to a single connected provider. ` +
        `Pass an explicit (provider, authType, model) route, or connect exactly one provider that offers this model.`);
}
function describeUnresolvedModel(name, reason, available, scope = {}) {
    const { provider, authType } = scope;
    if (reason === 'ambiguous') {
        return (`Model "${name}" is offered by multiple providers — pass an explicit ` +
            `provider + authType so the route is unambiguous.`);
    }
    if (reason === 'wrong_provider') {
        return `Model "${name}" is not offered by provider "${provider}" for this agent.`;
    }
    if (reason === 'wrong_auth_type') {
        const by = provider ? ` by provider "${provider}"` : '';
        return `Model "${name}" is not offered with auth type "${authType}"${by} for this agent.`;
    }
    const pool = provider
        ? available.filter((m) => m.provider.toLowerCase() === provider.toLowerCase())
        : available;
    const providerHint = provider ? ` (provider: ${provider})` : '';
    if (provider && pool.length === 0) {
        return (`Model "${name}" is not in this agent's discovered model list${providerHint}. ` +
            `This agent has no models from "${provider}": connect it or enable it for this agent first.`);
    }
    const options = [...new Set(pool.map(public_model_id_1.openAiModelId))];
    const shown = options.slice(0, HINT_LIMIT);
    return (`Model "${name}" is not in this agent's discovered model list${providerHint}. ` +
        `Connect the appropriate provider first, or choose from: ${shown.join(', ')}${options.length > shown.length ? ', …' : ''}`);
}
//# sourceMappingURL=resolve-model-route.js.map