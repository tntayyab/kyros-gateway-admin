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
var SessionGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const node_1 = require("better-auth/node");
const crypto_1 = require("crypto");
const auth_instance_1 = require("./auth.instance");
const public_decorator_1 = require("../common/decorators/public.decorator");
const tenant_cache_service_1 = require("../common/services/tenant-cache.service");
let SessionGuard = SessionGuard_1 = class SessionGuard {
    reflector;
    tenantCache;
    logger = new common_1.Logger(SessionGuard_1.name);
    cache = new Map();
    CACHE_TTL_MS = 60_000;
    MAX_CACHE_SIZE = 5_000;
    cleanupTimer;
    constructor(reflector, tenantCache) {
        this.reflector = reflector;
        this.tenantCache = tenantCache;
        this.cleanupTimer = setInterval(() => this.evictExpired(), 60_000);
        if (typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
            this.cleanupTimer.unref();
        }
    }
    onModuleDestroy() {
        clearInterval(this.cleanupTimer);
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        if (request.headers['x-api-key'])
            return true;
        if (!auth_instance_1.auth)
            return true;
        const cookieHeader = request.headers['cookie'];
        const cacheKey = typeof cookieHeader === 'string' && cookieHeader.length > 0
            ? this.hashCookie(cookieHeader)
            : null;
        if (cacheKey) {
            const cached = this.cache.get(cacheKey);
            if (cached && cached.expiresAt > Date.now()) {
                this.cache.delete(cacheKey);
                this.cache.set(cacheKey, cached);
                request.user = cached.user;
                request.session = cached.session;
                request.authMethod = 'session';
                await this.attachTenantContext(request, cached.user);
                return true;
            }
        }
        try {
            const session = await auth_instance_1.auth.api.getSession({
                headers: (0, node_1.fromNodeHeaders)(request.headers),
            });
            if (session) {
                request.user = session.user;
                request.session = session.session;
                request.authMethod = 'session';
                if (cacheKey)
                    this.storeInCache(cacheKey, session.user, session.session);
                await this.attachTenantContext(request, session.user);
                return true;
            }
        }
        catch (err) {
            this.logger.warn(`Session lookup failed: ${err.message}`);
        }
        return true;
    }
    async attachTenantContext(request, user) {
        const userId = user?.id;
        if (typeof userId !== 'string' || userId.length === 0)
            return;
        try {
            const tenantId = await this.tenantCache.resolve(userId);
            request.tenantContext = { tenantId, userId };
        }
        catch (err) {
            this.logger.warn(`Tenant resolution failed for session user: ${err.message}`);
            request.tenantContext = { tenantId: null, userId };
        }
    }
    invalidateCache(cookieHeader) {
        if (cookieHeader) {
            this.cache.delete(this.hashCookie(cookieHeader));
            return;
        }
        this.cache.clear();
    }
    hashCookie(cookieHeader) {
        return (0, crypto_1.createHash)('sha256').update(cookieHeader).digest('hex');
    }
    storeInCache(key, user, session) {
        this.evictExpired();
        while (this.cache.size >= this.MAX_CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey === undefined)
                break;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            user,
            session,
            expiresAt: Date.now() + this.CACHE_TTL_MS,
        });
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt <= now)
                this.cache.delete(key);
        }
    }
};
exports.SessionGuard = SessionGuard;
exports.SessionGuard = SessionGuard = SessionGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        tenant_cache_service_1.TenantCacheService])
], SessionGuard);
//# sourceMappingURL=session.guard.js.map