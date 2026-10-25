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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionMomentumService = exports.SESSION_MOMENTUM_MAX_KEY_LENGTH = exports.SESSION_MOMENTUM_MAX_SESSIONS = void 0;
const common_1 = require("@nestjs/common");
const MAX_ENTRIES = 5;
exports.SESSION_MOMENTUM_MAX_SESSIONS = 10_000;
exports.SESSION_MOMENTUM_MAX_KEY_LENGTH = 512;
const TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let SessionMomentumService = class SessionMomentumService {
    sessions = new Map();
    cleanupTimer;
    constructor() {
        this.cleanupTimer = setInterval(() => this.evictStale(), CLEANUP_INTERVAL_MS);
        if (typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
            this.cleanupTimer.unref();
        }
    }
    onModuleDestroy() {
        clearInterval(this.cleanupTimer);
    }
    getRecentTiers(sessionKey) {
        if (!this.isCacheableKey(sessionKey))
            return undefined;
        const entry = this.readFresh(sessionKey);
        return entry?.tiers;
    }
    getRecentCategories(sessionKey) {
        if (!this.isCacheableKey(sessionKey))
            return undefined;
        const entry = this.readFresh(sessionKey);
        if (!entry || entry.categories.length === 0)
            return undefined;
        return entry.categories;
    }
    recordTier(sessionKey, tier) {
        if (!this.isCacheableKey(sessionKey))
            return;
        const entry = this.getOrCreate(sessionKey);
        entry.tiers = [tier, ...entry.tiers].slice(0, MAX_ENTRIES);
        entry.lastUpdated = Date.now();
        this.touch(sessionKey, entry);
    }
    recordCategory(sessionKey, category) {
        if (!this.isCacheableKey(sessionKey))
            return;
        const entry = this.getOrCreate(sessionKey);
        entry.categories = [category, ...entry.categories].slice(0, MAX_ENTRIES);
        entry.lastUpdated = Date.now();
        this.touch(sessionKey, entry);
    }
    readFresh(sessionKey) {
        const entry = this.sessions.get(sessionKey);
        if (!entry)
            return undefined;
        if (Date.now() - entry.lastUpdated > TTL_MS) {
            this.sessions.delete(sessionKey);
            return undefined;
        }
        this.touch(sessionKey, entry);
        return entry;
    }
    getOrCreate(sessionKey) {
        const existing = this.sessions.get(sessionKey);
        if (existing)
            return existing;
        if (this.sessions.size >= exports.SESSION_MOMENTUM_MAX_SESSIONS) {
            const oldestKey = this.sessions.keys().next().value;
            if (oldestKey !== undefined)
                this.sessions.delete(oldestKey);
        }
        const entry = {
            tiers: [],
            categories: [],
            lastUpdated: Date.now(),
        };
        this.sessions.set(sessionKey, entry);
        return entry;
    }
    touch(sessionKey, entry) {
        this.sessions.delete(sessionKey);
        this.sessions.set(sessionKey, entry);
    }
    isCacheableKey(sessionKey) {
        return sessionKey.length <= exports.SESSION_MOMENTUM_MAX_KEY_LENGTH;
    }
    evictStale() {
        const now = Date.now();
        for (const [key, entry] of this.sessions) {
            if (now - entry.lastUpdated > TTL_MS) {
                this.sessions.delete(key);
            }
        }
    }
};
exports.SessionMomentumService = SessionMomentumService;
exports.SessionMomentumService = SessionMomentumService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SessionMomentumService);
//# sourceMappingURL=session-momentum.service.js.map