"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERSIST_MAX_ATTEMPTS = exports.REFRESH_EXPIRY_SKEW_MS = exports.REJECTED_TOKEN_EXPIRY = void 0;
exports.oauthRefreshKey = oauthRefreshKey;
exports.subscriptionCredentialLock = subscriptionCredentialLock;
exports.coordinateOAuthRefresh = coordinateOAuthRefresh;
exports.__resetOAuthRefreshCoordinator = __resetOAuthRefreshCoordinator;
exports.REJECTED_TOKEN_EXPIRY = 0;
exports.REFRESH_EXPIRY_SKEW_MS = 60_000;
exports.PERSIST_MAX_ATTEMPTS = 3;
function oauthRefreshKey(providerId, tenantId, label) {
    return `${providerId}:${tenantId}:${label ?? 'Default'}`;
}
function subscriptionCredentialLock(lock, tenantId, provider, label, serialize) {
    return (fn) => lock(tenantId, provider, label, async (ops) => fn({
        readFreshRaw: ops.readFreshRaw,
        persist: async (refreshed) => ops.writeRaw(serialize(refreshed)),
    }));
}
const inFlight = new Map();
async function coordinateOAuthRefresh(params) {
    const pending = inFlight.get(params.key);
    if (pending)
        return pending;
    const run = refreshOnce(params);
    inFlight.set(params.key, run);
    try {
        return await run;
    }
    finally {
        inFlight.delete(params.key);
    }
}
async function refreshOnce(params) {
    return params.withLock(async (ops) => {
        let current = params.callerBlob;
        const freshRaw = await ops.readFreshRaw();
        if (freshRaw) {
            const fresh = params.parse(freshRaw);
            if (fresh)
                current = fresh;
        }
        const rejectedToken = params.callerBlob.e === exports.REJECTED_TOKEN_EXPIRY && current.t === params.callerBlob.t;
        if (!rejectedToken && Date.now() < current.e - exports.REFRESH_EXPIRY_SKEW_MS)
            return current;
        const refreshed = await params.refresh(current);
        await persistWithRetry(params, ops.persist, refreshed);
        return refreshed;
    });
}
async function persistWithRetry(params, persist, refreshed) {
    let lastErr;
    for (let attempt = 1; attempt <= exports.PERSIST_MAX_ATTEMPTS; attempt++) {
        try {
            await persist(refreshed);
            return;
        }
        catch (err) {
            lastErr = err;
            params.logger.warn(`OAuth token persist attempt ${attempt}/${exports.PERSIST_MAX_ATTEMPTS} failed for ${params.key}: ${err}`);
        }
    }
    throw lastErr;
}
function __resetOAuthRefreshCoordinator() {
    inFlight.clear();
}
//# sourceMappingURL=oauth-refresh-coordinator.js.map