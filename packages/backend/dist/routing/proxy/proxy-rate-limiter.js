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
exports.ProxyRateLimiter = void 0;
const common_1 = require("@nestjs/common");
const manifest_error_1 = require("../../common/errors/manifest-error");
const env_util_1 = require("../../config/env.util");
const RATE_WINDOW_MS = 60_000;
const DEFAULT_RATE_MAX_REQUESTS = 200;
const DEFAULT_IP_RATE_MAX_REQUESTS = 500;
const MAX_RATE_ENTRIES = 50_000;
const DEFAULT_CONCURRENCY_MAX = 10;
const CLEANUP_INTERVAL_MS = 60_000;
let ProxyRateLimiter = class ProxyRateLimiter {
    rates = new Map();
    ipRates = new Map();
    concurrency = new Map();
    concurrencyMax = (0, env_util_1.optionalPositiveInteger)(process.env.MANIFEST_CONCURRENCY_MAX) ?? DEFAULT_CONCURRENCY_MAX;
    rateMaxRequests = (0, env_util_1.optionalPositiveInteger)(process.env.MANIFEST_RATE_MAX_REQUESTS) ?? DEFAULT_RATE_MAX_REQUESTS;
    ipRateMaxRequests = (0, env_util_1.optionalPositiveInteger)(process.env.MANIFEST_IP_RATE_MAX_REQUESTS) ??
        DEFAULT_IP_RATE_MAX_REQUESTS;
    cleanupTimer;
    constructor() {
        this.cleanupTimer = setInterval(() => this.evictExpired(), CLEANUP_INTERVAL_MS);
        if (typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
            this.cleanupTimer.unref();
        }
    }
    onModuleDestroy() {
        clearInterval(this.cleanupTimer);
    }
    checkLimit(tenantId) {
        const now = Date.now();
        let entry = this.rates.get(tenantId);
        if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
            entry = { count: 0, windowStart: now };
        }
        if (entry.count >= this.rateMaxRequests) {
            throw new manifest_error_1.ManifestError('M201', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        entry.count++;
        this.rates.delete(tenantId);
        this.rates.set(tenantId, entry);
        this.evictLruIfNeeded();
    }
    checkIpLimit(ip) {
        const now = Date.now();
        let entry = this.ipRates.get(ip);
        if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
            entry = { count: 0, windowStart: now };
        }
        if (entry.count >= this.ipRateMaxRequests) {
            throw new manifest_error_1.ManifestError('M202', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        entry.count++;
        this.ipRates.delete(ip);
        this.ipRates.set(ip, entry);
        this.evictIpLruIfNeeded();
    }
    acquireSlot(tenantId) {
        const current = this.concurrency.get(tenantId) ?? 0;
        if (current >= this.concurrencyMax) {
            throw new manifest_error_1.ManifestError('M203', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        this.concurrency.set(tenantId, current + 1);
    }
    releaseSlot(tenantId) {
        const current = this.concurrency.get(tenantId) ?? 0;
        if (current <= 1) {
            this.concurrency.delete(tenantId);
        }
        else {
            this.concurrency.set(tenantId, current - 1);
        }
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of this.rates) {
            if (now - entry.windowStart >= RATE_WINDOW_MS) {
                this.rates.delete(key);
            }
        }
        for (const [key, entry] of this.ipRates) {
            if (now - entry.windowStart >= RATE_WINDOW_MS) {
                this.ipRates.delete(key);
            }
        }
    }
    evictLruIfNeeded() {
        while (this.rates.size > MAX_RATE_ENTRIES) {
            const oldest = this.rates.keys().next().value;
            this.rates.delete(oldest);
        }
    }
    evictIpLruIfNeeded() {
        while (this.ipRates.size > MAX_RATE_ENTRIES) {
            const oldest = this.ipRates.keys().next().value;
            this.ipRates.delete(oldest);
        }
    }
};
exports.ProxyRateLimiter = ProxyRateLimiter;
exports.ProxyRateLimiter = ProxyRateLimiter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ProxyRateLimiter);
//# sourceMappingURL=proxy-rate-limiter.js.map