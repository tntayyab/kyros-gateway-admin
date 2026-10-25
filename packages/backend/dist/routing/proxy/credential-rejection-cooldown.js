"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialRejectionCooldown = exports.CREDENTIAL_REJECTION_COOLDOWN_MS = void 0;
exports.CREDENTIAL_REJECTION_COOLDOWN_MS = 5 * 60_000;
const MAX_ENTRIES = 2_000;
class CredentialRejectionCooldown {
    ttlMs;
    maxEntries;
    now;
    rejections = new Map();
    constructor(ttlMs = exports.CREDENTIAL_REJECTION_COOLDOWN_MS, maxEntries = MAX_ENTRIES, now = () => Date.now()) {
        this.ttlMs = ttlMs;
        this.maxEntries = maxEntries;
        this.now = now;
    }
    reject(ref) {
        const key = connectionKey(ref);
        if (!key || !ref.secret)
            return;
        this.rejections.delete(key);
        if (this.rejections.size >= this.maxEntries)
            this.evict();
        this.rejections.set(key, { until: this.now() + this.ttlMs, secret: ref.secret });
    }
    rejectedUntil(ref) {
        const key = connectionKey(ref);
        if (!key)
            return null;
        const rejection = this.rejections.get(key);
        if (!rejection)
            return null;
        if (rejection.until <= this.now()) {
            this.rejections.delete(key);
            return null;
        }
        return rejection.secret === ref.secret ? rejection.until : null;
    }
    evict() {
        const now = this.now();
        for (const [key, rejection] of this.rejections) {
            if (rejection.until <= now)
                this.rejections.delete(key);
        }
        if (this.rejections.size < this.maxEntries)
            return;
        const oldest = this.rejections.keys().next().value;
        this.rejections.delete(oldest);
    }
}
exports.CredentialRejectionCooldown = CredentialRejectionCooldown;
function connectionKey(ref) {
    if (!ref.tenantId)
        return null;
    return [
        ref.tenantId,
        ref.connectionId ?? '',
        ref.provider.toLowerCase(),
        ref.authType ?? '',
        ref.keyLabel ?? '',
        ref.model.toLowerCase(),
    ].join('\u0000');
}
//# sourceMappingURL=credential-rejection-cooldown.js.map