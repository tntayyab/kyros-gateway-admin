"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtlFifoCache = void 0;
class TtlFifoCache {
    entries = new Map();
    maxEntries;
    ttlMs;
    now;
    constructor(opts) {
        this.maxEntries = opts.maxEntries;
        this.ttlMs = opts.ttlMs;
        this.now = opts.now ?? Date.now;
    }
    async resolve(key, loader, shouldCache = () => true) {
        const cached = this.entries.get(key);
        if (cached && cached.expiresAt > this.now())
            return cached.value;
        if (cached)
            this.entries.delete(key);
        const value = await loader(key);
        if (!shouldCache(value))
            return value;
        if (this.entries.size >= this.maxEntries && !this.entries.has(key)) {
            const firstKey = this.entries.keys().next().value;
            if (firstKey !== undefined)
                this.entries.delete(firstKey);
        }
        this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
        return value;
    }
    invalidate(key) {
        this.entries.delete(key);
    }
}
exports.TtlFifoCache = TtlFifoCache;
//# sourceMappingURL=ttl-fifo-cache.js.map