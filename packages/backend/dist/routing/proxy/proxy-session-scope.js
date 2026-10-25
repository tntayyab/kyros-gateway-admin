"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProxySessionScope = buildProxySessionScope;
const crypto_1 = require("crypto");
const DEFAULT_SESSION_KEY = 'default';
const SESSION_SCOPE_VERSION = 'v1';
function buildProxySessionScope(tenantId, agentId, sessionHeader) {
    const explicitSessionKey = typeof sessionHeader === 'string' && sessionHeader.length > 0 ? sessionHeader : undefined;
    const sessionKey = explicitSessionKey ?? DEFAULT_SESSION_KEY;
    const digest = (0, crypto_1.createHash)('sha256')
        .update(tenantId)
        .update('\0')
        .update(agentId)
        .update('\0')
        .update(sessionKey)
        .digest('hex');
    const cacheKey = `${SESSION_SCOPE_VERSION}:${digest}`;
    return {
        sessionKey,
        cacheKey,
        ...(explicitSessionKey ? { providerCacheKey: cacheKey, momentumKey: cacheKey } : {}),
    };
}
//# sourceMappingURL=proxy-session-scope.js.map