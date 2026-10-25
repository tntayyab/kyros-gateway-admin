"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThinkingBlockCache = exports.MAX_CACHE_ENTRIES = void 0;
const TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
exports.MAX_CACHE_ENTRIES = 10_000;
function normalizeRouteContext(routeContext) {
    if (!routeContext)
        return undefined;
    return {
        provider: routeContext.provider.trim().toLowerCase(),
        authType: (routeContext.authType ?? 'api_key').trim().toLowerCase(),
        model: routeContext.model.trim().toLowerCase(),
    };
}
function routeContextMatches(stored, requested) {
    if (!requested)
        return true;
    if (!stored)
        return false;
    return (stored.provider === requested.provider &&
        stored.authType === requested.authType &&
        stored.model === requested.model);
}
class ThinkingBlockCache {
    cache = new Map();
    lastCleanup = Date.now();
    store(sessionKey, firstToolUseId, blocks, routeContext) {
        if (blocks.length === 0)
            return;
        this.maybeCleanup();
        const normalizedRouteContext = normalizeRouteContext(routeContext);
        this.cache.set(`${sessionKey}:${firstToolUseId}`, {
            blocks,
            ...(normalizedRouteContext ? { routeContext: normalizedRouteContext } : {}),
            expiresAt: Date.now() + TTL_MS,
        });
        this.evictOverflow();
    }
    evictOverflow() {
        while (this.cache.size > exports.MAX_CACHE_ENTRIES) {
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
    }
    retrieve(sessionKey, firstToolUseId, routeContext) {
        const entry = this.cache.get(`${sessionKey}:${firstToolUseId}`);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(`${sessionKey}:${firstToolUseId}`);
            return null;
        }
        if (!routeContextMatches(entry.routeContext, normalizeRouteContext(routeContext)))
            return null;
        return entry.blocks;
    }
    clearSession(sessionKey) {
        const prefix = `${sessionKey}:`;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix))
                this.cache.delete(key);
        }
    }
    maybeCleanup() {
        const now = Date.now();
        if (now - this.lastCleanup < CLEANUP_INTERVAL_MS)
            return;
        this.lastCleanup = now;
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt)
                this.cache.delete(key);
        }
    }
}
exports.ThinkingBlockCache = ThinkingBlockCache;
//# sourceMappingURL=thinking-block-cache.js.map