"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingStore = void 0;
class PendingStore {
    ttlMs;
    entries_ = new Map();
    constructor(ttlMs) {
        this.ttlMs = ttlMs;
    }
    set(key, value) {
        this.cleanup();
        const entry = { ...value, expiresAt: Date.now() + this.ttlMs };
        this.entries_.set(key, entry);
        return entry;
    }
    get(key) {
        const entry = this.entries_.get(key);
        if (!entry)
            return undefined;
        if (entry.expiresAt < Date.now()) {
            this.entries_.delete(key);
            return undefined;
        }
        return entry;
    }
    peek(key) {
        return this.entries_.get(key);
    }
    consume(key) {
        const entry = this.get(key);
        if (entry)
            this.entries_.delete(key);
        return entry;
    }
    delete(key) {
        this.entries_.delete(key);
    }
    size() {
        this.cleanup();
        return this.entries_.size;
    }
    isEmpty() {
        return this.size() === 0;
    }
    *entries() {
        this.cleanup();
        for (const [key, value] of this.entries_) {
            yield [key, value];
        }
    }
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.entries_) {
            if (value.expiresAt < now)
                this.entries_.delete(key);
        }
    }
}
exports.PendingStore = PendingStore;
//# sourceMappingURL=pending-store.js.map