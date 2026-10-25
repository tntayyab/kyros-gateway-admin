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
var AgentKeyAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentKeyAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const agent_api_key_entity_1 = require("../../entities/agent-api-key.entity");
const hash_util_1 = require("../../common/utils/hash.util");
const api_key_constants_1 = require("../../common/constants/api-key.constants");
const local_ip_1 = require("../../common/utils/local-ip");
const MIN_TOKEN_LENGTH = 12;
function cacheKey(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
let AgentKeyAuthGuard = class AgentKeyAuthGuard {
    static { AgentKeyAuthGuard_1 = this; }
    keyRepo;
    configService;
    logger = new common_1.Logger(AgentKeyAuthGuard_1.name);
    static cache = new Map();
    devContext = null;
    CACHE_TTL_MS = 5 * 60 * 1000;
    MAX_CACHE_SIZE = 10_000;
    static negativeCache = new Map();
    NEGATIVE_CACHE_TTL_MS = 30 * 1000;
    MAX_NEGATIVE_CACHE_SIZE = 10_000;
    cleanupTimer;
    constructor(keyRepo, configService) {
        this.keyRepo = keyRepo;
        this.configService = configService;
        this.cleanupTimer = setInterval(() => this.evictExpired(), 60_000);
        if (typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
            this.cleanupTimer.unref();
        }
    }
    async onModuleInit() {
        try {
            const legacyCount = await this.keyRepo
                .createQueryBuilder('k')
                .where("k.key_hash NOT LIKE '%:%'")
                .andWhere('k.is_active = true')
                .getCount();
            if (legacyCount > 0) {
                this.logger.warn(`${legacyCount} active agent API key(s) still use the legacy static-salt hash. ` +
                    'Rotate them in the dashboard (Agent → Rotate Key) when convenient.');
            }
        }
        catch (err) {
            this.logger.debug(`Legacy hash audit skipped: ${err.message}`);
        }
    }
    onModuleDestroy() {
        clearInterval(this.cleanupTimer);
        this.clearCache();
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const isDevLoopback = this.configService.get('app.nodeEnv') === 'development' && (0, local_ip_1.isLoopbackPeer)(request);
        if (!authHeader) {
            if (await this.handleDevLoopback(request, isDevLoopback))
                return true;
            this.logger.warn(`Request without auth from ${request.ip}`);
            throw new common_1.UnauthorizedException('Authorization header required');
        }
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        if (!token) {
            throw new common_1.UnauthorizedException('Empty token');
        }
        if (!token.startsWith(api_key_constants_1.API_KEY_PREFIX)) {
            if (await this.handleDevLoopback(request, isDevLoopback))
                return true;
            throw new common_1.UnauthorizedException('Invalid API key format');
        }
        if (token.length < MIN_TOKEN_LENGTH) {
            throw new common_1.UnauthorizedException('Invalid API key format');
        }
        return this.validateMnfstToken(request, token);
    }
    invalidateCache(key) {
        const hashed = cacheKey(key);
        AgentKeyAuthGuard_1.cache.delete(hashed);
        AgentKeyAuthGuard_1.negativeCache.delete(hashed);
    }
    clearCache() {
        AgentKeyAuthGuard_1.cache.clear();
        AgentKeyAuthGuard_1.negativeCache.clear();
    }
    setContext(request, ctx) {
        request.ingestionContext = ctx;
    }
    async handleDevLoopback(request, isDevLoopback) {
        if (!isDevLoopback)
            return false;
        const devCtx = await this.resolveDevContext();
        if (!devCtx)
            return false;
        this.setContext(request, devCtx);
        return true;
    }
    async validateMnfstToken(request, token) {
        const hashed = cacheKey(token);
        const now = Date.now();
        const negativeExpiry = AgentKeyAuthGuard_1.negativeCache.get(hashed);
        if (negativeExpiry !== undefined && negativeExpiry > now) {
            AgentKeyAuthGuard_1.negativeCache.delete(hashed);
            AgentKeyAuthGuard_1.negativeCache.set(hashed, negativeExpiry);
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        if (negativeExpiry !== undefined) {
            AgentKeyAuthGuard_1.negativeCache.delete(hashed);
        }
        const cached = AgentKeyAuthGuard_1.cache.get(hashed);
        if (cached && cached.keyExpiresAt !== null && cached.keyExpiresAt <= now) {
            AgentKeyAuthGuard_1.cache.delete(hashed);
        }
        else if (cached && cached.expiresAt > now) {
            let stillActive;
            try {
                stillActive = await this.keyRepo.existsBy({
                    id: cached.keyId,
                    is_active: true,
                });
            }
            catch (err) {
                this.logger.warn(`Agent-key activity recheck failed: ${err.message}`);
                throw new common_1.UnauthorizedException('Invalid API key');
            }
            if (!stillActive) {
                AgentKeyAuthGuard_1.cache.delete(hashed);
                this.rememberInvalid(hashed);
                throw new common_1.UnauthorizedException('Invalid API key');
            }
            AgentKeyAuthGuard_1.cache.delete(hashed);
            AgentKeyAuthGuard_1.cache.set(hashed, cached);
            this.setContext(request, {
                tenantId: cached.tenantId,
                agentId: cached.agentId,
                agentName: cached.agentName,
                userId: cached.userId,
            });
            return true;
        }
        const prefix = (0, hash_util_1.keyPrefix)(token);
        const candidates = await this.keyRepo
            .createQueryBuilder('k')
            .select([
            'k.id',
            'k.key_hash',
            'k.tenant_id',
            'k.agent_id',
            'k.expires_at',
            'a.name',
            't.owner_user_id',
        ])
            .leftJoin('k.agent', 'a')
            .leftJoin('k.tenant', 't')
            .where('k.key_prefix = :prefix', { prefix })
            .andWhere('k.is_active = true')
            .andWhere('a.deleted_at IS NULL')
            .getMany();
        const keyRecord = candidates.find((c) => (0, hash_util_1.verifyKey)(token, c.key_hash));
        if (!keyRecord) {
            this.rememberInvalid(hashed);
            this.logger.warn(`Rejected unknown agent key (prefix: ${api_key_constants_1.API_KEY_PREFIX}...)`);
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        if (!keyRecord.agent || !keyRecord.tenant) {
            this.rememberInvalid(hashed);
            this.logger.warn(`Rejected agent key with unhydrated relations (prefix: ${api_key_constants_1.API_KEY_PREFIX}...)`);
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
            request.manifestErrorContext = {
                tenantId: keyRecord.tenant_id,
                agentId: keyRecord.agent_id,
                agentName: keyRecord.agent.name,
                userId: keyRecord.tenant.owner_user_id,
            };
            throw new common_1.UnauthorizedException('API key expired');
        }
        this.keyRepo
            .createQueryBuilder()
            .update(agent_api_key_entity_1.AgentApiKey)
            .set({ last_used_at: () => 'CURRENT_TIMESTAMP' })
            .where('id = :id', { id: keyRecord.id })
            .execute()
            .catch((err) => this.logger.warn(`Failed to update last_used_at: ${err.message}`));
        this.evictExpired();
        while (AgentKeyAuthGuard_1.cache.size >= this.MAX_CACHE_SIZE) {
            const firstKey = AgentKeyAuthGuard_1.cache.keys().next().value;
            if (firstKey === undefined)
                break;
            AgentKeyAuthGuard_1.cache.delete(firstKey);
        }
        AgentKeyAuthGuard_1.cache.set(hashed, {
            keyId: keyRecord.id,
            tenantId: keyRecord.tenant_id,
            agentId: keyRecord.agent_id,
            agentName: keyRecord.agent.name,
            userId: keyRecord.tenant.owner_user_id,
            expiresAt: Date.now() + this.CACHE_TTL_MS,
            keyExpiresAt: keyRecord.expires_at ? new Date(keyRecord.expires_at).getTime() : null,
        });
        this.setContext(request, {
            tenantId: keyRecord.tenant_id,
            agentId: keyRecord.agent_id,
            agentName: keyRecord.agent.name,
            userId: keyRecord.tenant.owner_user_id,
        });
        return true;
    }
    async resolveDevContext() {
        if (this.devContext && this.devContext.expiresAt > Date.now()) {
            return this.devContext.context;
        }
        const seedKey = await this.keyRepo
            .createQueryBuilder('k')
            .leftJoinAndSelect('k.agent', 'a')
            .leftJoinAndSelect('k.tenant', 't')
            .where('k.is_active = true')
            .andWhere('k.tenant_id = :tid', { tid: 'seed-tenant-001' })
            .getOne();
        const keyRecord = seedKey ??
            (await this.keyRepo.findOne({
                where: { is_active: true },
                relations: ['agent', 'tenant'],
            }));
        if (!keyRecord)
            return null;
        const ctx = {
            tenantId: keyRecord.tenant_id,
            agentId: keyRecord.agent_id,
            agentName: keyRecord.agent.name,
            userId: keyRecord.tenant.owner_user_id,
        };
        this.devContext = { context: ctx, expiresAt: Date.now() + this.CACHE_TTL_MS };
        return ctx;
    }
    rememberInvalid(hashed) {
        this.evictExpired();
        while (AgentKeyAuthGuard_1.negativeCache.size >= this.MAX_NEGATIVE_CACHE_SIZE) {
            const firstKey = AgentKeyAuthGuard_1.negativeCache.keys().next().value;
            if (firstKey === undefined)
                break;
            AgentKeyAuthGuard_1.negativeCache.delete(firstKey);
        }
        AgentKeyAuthGuard_1.negativeCache.set(hashed, Date.now() + this.NEGATIVE_CACHE_TTL_MS);
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of AgentKeyAuthGuard_1.cache) {
            if (entry.expiresAt <= now)
                AgentKeyAuthGuard_1.cache.delete(key);
        }
        for (const [key, expiresAt] of AgentKeyAuthGuard_1.negativeCache) {
            if (expiresAt <= now)
                AgentKeyAuthGuard_1.negativeCache.delete(key);
        }
    }
};
exports.AgentKeyAuthGuard = AgentKeyAuthGuard;
exports.AgentKeyAuthGuard = AgentKeyAuthGuard = AgentKeyAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_api_key_entity_1.AgentApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], AgentKeyAuthGuard);
//# sourceMappingURL=agent-key-auth.guard.js.map