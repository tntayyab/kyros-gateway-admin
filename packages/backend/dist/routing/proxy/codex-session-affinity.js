"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexSessionAffinity = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const SESSION_TTL_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;
const MAX_ENTRIES = 10_000;
const MAX_CACHE_KEY_LEN = 512;
function derivedUuid(namespace, cacheKey) {
    const digest = (0, crypto_1.createHash)('sha256').update(`${namespace}\u0000${cacheKey}`).digest();
    digest[6] = (digest[6] & 0x0f) | 0x40;
    digest[8] = (digest[8] & 0x3f) | 0x80;
    const hex = digest.subarray(0, 16).toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
let CodexSessionAffinity = class CodexSessionAffinity {
    sessions = new Map();
    nextIncarnation = 1;
    lastCleanup = Date.now();
    prepare(apiKey, requestBody) {
        const callerKey = requestBody.prompt_cache_key;
        const cacheKey = typeof callerKey === 'string' && callerKey && callerKey.length <= MAX_CACHE_KEY_LEN
            ? callerKey
            : null;
        const storeKey = cacheKey ? `${apiKey}\u0000${cacheKey}` : undefined;
        const session = storeKey
            ? this.getOrCreateSession(storeKey, cacheKey)
            : this.createSession(null);
        requestBody.prompt_cache_key = session.promptCacheKey;
        const headers = {
            'session-id': session.sessionId,
            'thread-id': session.threadId,
        };
        if (session.turnState)
            headers['x-codex-turn-state'] = session.turnState;
        return storeKey ? { headers, storeKey, incarnation: session.incarnation } : { headers };
    }
    capture(storeKey, response, incarnation) {
        if (!storeKey)
            return;
        const session = this.sessions.get(storeKey);
        if (!session)
            return;
        if (incarnation !== undefined && incarnation !== session.incarnation)
            return;
        if (!response.ok) {
            delete session.turnState;
            return;
        }
        const token = response.headers.get('x-codex-turn-state');
        if (!token)
            return;
        session.turnState = token;
        session.expiresAt = Date.now() + SESSION_TTL_MS;
    }
    getOrCreateSession(storeKey, callerCacheKey) {
        this.maybeCleanup();
        const existing = this.sessions.get(storeKey);
        if (existing && Date.now() <= existing.expiresAt) {
            existing.expiresAt = Date.now() + SESSION_TTL_MS;
            this.sessions.delete(storeKey);
            this.sessions.set(storeKey, existing);
            return existing;
        }
        if (existing)
            this.sessions.delete(storeKey);
        if (this.sessions.size >= MAX_ENTRIES) {
            const oldest = this.sessions.keys().next().value;
            this.sessions.delete(oldest);
        }
        const session = this.createSession(callerCacheKey);
        session.incarnation = this.nextIncarnation++;
        this.sessions.set(storeKey, session);
        return session;
    }
    createSession(callerCacheKey) {
        if (callerCacheKey === null) {
            return {
                sessionId: (0, crypto_1.randomUUID)(),
                threadId: (0, crypto_1.randomUUID)(),
                promptCacheKey: (0, crypto_1.randomUUID)(),
                expiresAt: Date.now() + SESSION_TTL_MS,
                incarnation: 0,
            };
        }
        return {
            sessionId: derivedUuid('session-id', callerCacheKey),
            threadId: derivedUuid('thread-id', callerCacheKey),
            promptCacheKey: callerCacheKey,
            expiresAt: Date.now() + SESSION_TTL_MS,
            incarnation: 0,
        };
    }
    maybeCleanup() {
        const now = Date.now();
        if (now - this.lastCleanup < CLEANUP_INTERVAL_MS)
            return;
        this.lastCleanup = now;
        for (const [key, session] of this.sessions) {
            if (now > session.expiresAt)
                this.sessions.delete(key);
        }
    }
};
exports.CodexSessionAffinity = CodexSessionAffinity;
exports.CodexSessionAffinity = CodexSessionAffinity = __decorate([
    (0, common_1.Injectable)()
], CodexSessionAffinity);
//# sourceMappingURL=codex-session-affinity.js.map