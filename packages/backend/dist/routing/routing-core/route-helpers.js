"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readOverrideRoute = readOverrideRoute;
exports.readAutoAssignedRoute = readAutoAssignedRoute;
exports.readFallbackRoutes = readFallbackRoutes;
exports.effectiveRoute = effectiveRoute;
exports.explicitRoute = explicitRoute;
exports.unambiguousRoute = unambiguousRoute;
exports.subscriptionPreferredRoute = subscriptionPreferredRoute;
exports.routeMatches = routeMatches;
const manifest_shared_1 = require("manifest-shared");
function readOverrideRoute(row) {
    return (0, manifest_shared_1.isModelRoute)(row.override_route) ? row.override_route : null;
}
function readAutoAssignedRoute(row) {
    return (0, manifest_shared_1.isModelRoute)(row.auto_assigned_route) ? row.auto_assigned_route : null;
}
function readFallbackRoutes(row) {
    return (0, manifest_shared_1.isModelRouteArray)(row.fallback_routes) ? row.fallback_routes : null;
}
function effectiveRoute(row) {
    return readOverrideRoute(row) ?? readAutoAssignedRoute(row);
}
function explicitRoute(model, provider, authType, keyLabel) {
    if (!provider || !authType)
        return null;
    return keyLabel ? { provider, authType, model, keyLabel } : { provider, authType, model };
}
function unambiguousRoute(model, available, keyLabel) {
    const matches = available.filter((m) => m.id === model);
    if (matches.length !== 1)
        return null;
    const m = matches[0];
    if (!m.authType)
        return null;
    return keyLabel
        ? { provider: m.provider, authType: m.authType, model: m.id, keyLabel }
        : { provider: m.provider, authType: m.authType, model: m.id };
}
function subscriptionPreferredRoute(model, available) {
    const matches = available.filter((m) => m.id === model && m.authType);
    if (matches.length !== 2)
        return null;
    const subscription = matches.find((m) => m.authType === 'subscription');
    const apiKey = matches.find((m) => m.authType === 'api_key');
    if (!subscription || !apiKey)
        return null;
    if (subscription.provider.toLowerCase() !== apiKey.provider.toLowerCase())
        return null;
    return { provider: subscription.provider, authType: 'subscription', model: subscription.id };
}
function routeMatches(a, b) {
    if (a.provider.toLowerCase() !== b.provider.toLowerCase())
        return false;
    if (a.authType !== b.authType)
        return false;
    if (a.model !== b.model)
        return false;
    return normalizeKeyLabel(a.keyLabel) === normalizeKeyLabel(b.keyLabel);
}
function normalizeKeyLabel(label) {
    if (!label)
        return null;
    const trimmed = label.trim();
    return trimmed === '' ? null : trimmed.toLowerCase();
}
//# sourceMappingURL=route-helpers.js.map