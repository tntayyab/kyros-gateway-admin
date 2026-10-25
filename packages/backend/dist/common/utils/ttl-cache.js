"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtlCache = void 0;
class TtlCache {
    store = new Map();
    maxSize;
    ttlMs;
    constructor(options) {
        this.maxSize = options.maxSize;
        this.ttlMs = options.ttlMs;
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return undefined;
        if (entry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    set(key, value) {
        if (this.store.size >= this.maxSize && !this.store.has(key)) {
            const firstKey = this.store.keys().next().value;
            if (firstKey !== undefined)
                this.store.delete(firstKey);
        }
        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }
    delete(key) {
        return this.store.delete(key);
    }
    has(key) {
        const entry = this.store.get(key);
        if (!entry)
            return false;
        if (entry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
    clear() {
        this.store.clear();
    }
    get size() {
        return this.store.size;
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (entry.expiresAt <= now) {
                this.store.delete(key);
            }
        }
    }
}
exports.TtlCache = TtlCache;
//# sourceMappingURL=ttl-cache.js.map