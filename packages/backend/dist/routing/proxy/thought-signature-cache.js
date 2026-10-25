"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtSignatureCache = exports.MAX_CACHE_ENTRIES = void 0;
const TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
exports.MAX_CACHE_ENTRIES = 10_000;
class ThoughtSignatureCache {
    cache = new Map();
    lastCleanup = Date.now();
    store(sessionKey, toolCallId, signature) {
        this.maybeCleanup();
        this.cache.set(`${sessionKey}:${toolCallId}`, {
            signature,
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
    retrieve(sessionKey, toolCallId) {
        const entry = this.cache.get(`${sessionKey}:${toolCallId}`);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(`${sessionKey}:${toolCallId}`);
            return null;
        }
        return entry.signature;
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
exports.ThoughtSignatureCache = ThoughtSignatureCache;
//# sourceMappingURL=thought-signature-cache.js.map