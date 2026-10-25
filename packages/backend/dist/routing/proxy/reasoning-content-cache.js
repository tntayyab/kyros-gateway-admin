"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReasoningContentCache_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasoningContentCache = exports.MAX_CACHE_ENTRIES = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reasoning_content_cache_entry_entity_1 = require("../../entities/reasoning-content-cache-entry.entity");
const reasoning_format_1 = require("./reasoning-format");
const reasoning_model_catalog_1 = require("./reasoning-model-catalog");
const TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
exports.MAX_CACHE_ENTRIES = 10_000;
let ReasoningContentCache = ReasoningContentCache_1 = class ReasoningContentCache {
    repo;
    modelCatalog;
    logger = new common_1.Logger(ReasoningContentCache_1.name);
    cache = new Map();
    lastCleanup = Date.now();
    constructor(repo, modelCatalog) {
        this.repo = repo;
        this.modelCatalog = modelCatalog;
    }
    store(sessionKey, firstToolCallId, content) {
        this.storeByCacheKey(sessionKey, firstToolCallId, content);
    }
    storeByCacheKey(sessionKey, cacheKey, content) {
        if (!content)
            return;
        this.maybeCleanup();
        const expiresAt = Date.now() + TTL_MS;
        this.cache.set(`${sessionKey}:${cacheKey}`, { content, expiresAt });
        this.evictOverflow();
        void this.persist(sessionKey, cacheKey, content, expiresAt);
    }
    retrieve(sessionKey, firstToolCallId) {
        const entry = this.cache.get(`${sessionKey}:${firstToolCallId}`);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(`${sessionKey}:${firstToolCallId}`);
            return null;
        }
        return entry.content;
    }
    async retrieveMany(sessionKey, cacheKeys) {
        this.maybeCleanup();
        const result = new Map();
        const missing = [];
        for (const id of [...new Set(cacheKeys)]) {
            const local = this.retrieve(sessionKey, id);
            if (local) {
                result.set(id, local);
            }
            else {
                missing.push(id);
            }
        }
        if (missing.length === 0 || !this.repo)
            return result;
        try {
            const rows = await this.repo.find({
                where: {
                    session_key: sessionKey,
                    first_tool_call_id: (0, typeorm_2.In)(missing),
                },
            });
            const now = Date.now();
            const expired = [];
            for (const row of rows) {
                if (new Date(row.expires_at).getTime() <= now) {
                    expired.push(row.first_tool_call_id);
                    continue;
                }
                result.set(row.first_tool_call_id, row.content);
                this.cache.set(`${sessionKey}:${row.first_tool_call_id}`, {
                    content: row.content,
                    expiresAt: new Date(row.expires_at).getTime(),
                });
            }
            this.evictOverflow();
            if (expired.length > 0)
                void this.deleteExpired(sessionKey, expired);
        }
        catch (err) {
            this.logger.warn(`Failed to read shared reasoning_content cache: ${String(err)}`);
        }
        return result;
    }
    async prepareRequest(body, sessionKey, endpointKey, model) {
        if (!endpointKey || !(0, reasoning_format_1.supportsReasoningContent)(endpointKey, model, this.modelCatalog)) {
            return body;
        }
        const messages = body.messages;
        if (!Array.isArray(messages))
            return body;
        const includeNonToolTurns = messages.some((message) => !!message &&
            typeof message === 'object' &&
            !Array.isArray(message) &&
            Array.isArray(message.tool_calls) &&
            message.tool_calls.length > 0);
        const candidates = messages.map((message) => reasoningReplayCandidate(message, includeNonToolTurns));
        if (!candidates.some(Boolean))
            return body;
        const keys = candidates.flatMap((candidate) => candidate?.cacheKey ? [candidate.cacheKey] : []);
        const repeatedKeys = repeatedReplayKeys(keys);
        const cached = keys.length > 0 ? await this.retrieveMany(sessionKey, keys) : new Map();
        let changed = false;
        const nextMessages = messages.map((message, index) => {
            const candidate = candidates[index];
            if (!candidate)
                return message;
            const content = candidate.cacheKey && !repeatedKeys.has(candidate.cacheKey)
                ? (cached.get(candidate.cacheKey) ?? '')
                : '';
            if (message.reasoning_content === content)
                return message;
            changed = true;
            return { ...message, reasoning_content: content };
        });
        return changed ? { ...body, messages: nextMessages } : body;
    }
    clearSession(sessionKey) {
        const prefix = `${sessionKey}:`;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix))
                this.cache.delete(key);
        }
        if (this.repo) {
            void this.repo.delete({ session_key: sessionKey }).catch((err) => {
                this.logger.warn(`Failed to clear shared reasoning_content cache: ${String(err)}`);
            });
        }
    }
    evictOverflow() {
        while (this.cache.size > exports.MAX_CACHE_ENTRIES) {
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
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
        if (this.repo)
            void this.cleanupSharedExpired(now);
    }
    async persist(sessionKey, firstToolCallId, content, expiresAt) {
        if (!this.repo)
            return;
        const now = new Date().toISOString();
        try {
            await this.repo.upsert({
                session_key: sessionKey,
                first_tool_call_id: firstToolCallId,
                content,
                expires_at: new Date(expiresAt).toISOString(),
                created_at: now,
                updated_at: now,
            }, ['session_key', 'first_tool_call_id']);
        }
        catch (err) {
            this.logger.warn(`Failed to persist reasoning_content cache: ${String(err)}`);
        }
    }
    async deleteExpired(sessionKey, firstToolCallIds) {
        if (!this.repo || firstToolCallIds.length === 0)
            return;
        try {
            await this.repo.delete({
                session_key: sessionKey,
                first_tool_call_id: (0, typeorm_2.In)(firstToolCallIds),
            });
        }
        catch {
        }
    }
    async cleanupSharedExpired(now) {
        if (!this.repo)
            return;
        try {
            await this.repo
                .createQueryBuilder()
                .delete()
                .where('expires_at < :now', { now: new Date(now).toISOString() })
                .execute();
        }
        catch {
        }
    }
};
exports.ReasoningContentCache = ReasoningContentCache;
exports.ReasoningContentCache = ReasoningContentCache = ReasoningContentCache_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, typeorm_1.InjectRepository)(reasoning_content_cache_entry_entity_1.ReasoningContentCacheEntry)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)(reasoning_model_catalog_1.ModelsDevReasoningCatalog)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], ReasoningContentCache);
function reasoningReplayCandidate(message, includeNonToolTurns) {
    if (!message || typeof message !== 'object' || Array.isArray(message))
        return null;
    const record = message;
    if (record.role !== 'assistant')
        return null;
    if (typeof record.reasoning_content === 'string' && record.reasoning_content)
        return null;
    if (!Array.isArray(record.tool_calls) || record.tool_calls.length === 0) {
        return includeNonToolTurns ? { cacheKey: null } : null;
    }
    const firstToolCall = record.tool_calls[0];
    if (!firstToolCall || typeof firstToolCall !== 'object' || Array.isArray(firstToolCall)) {
        return { cacheKey: null };
    }
    const id = firstToolCall.id;
    return { cacheKey: typeof id === 'string' && id ? id : null };
}
function repeatedReplayKeys(keys) {
    const counts = new Map();
    for (const key of keys) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key));
}
//# sourceMappingURL=reasoning-content-cache.js.map