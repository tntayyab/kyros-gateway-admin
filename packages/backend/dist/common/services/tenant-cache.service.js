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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantCacheService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const tenant_entity_1 = require("../../entities/tenant.entity");
const ttl_fifo_cache_1 = require("../utils/ttl-fifo-cache");
let TenantCacheService = class TenantCacheService {
    tenantRepo;
    cache = new ttl_fifo_cache_1.TtlFifoCache({
        maxEntries: 5_000,
        ttlMs: 300_000,
    });
    constructor(tenantRepo) {
        this.tenantRepo = tenantRepo;
    }
    async resolve(userId) {
        return this.cache.resolve(userId, async (uid) => {
            const tenant = await this.tenantRepo.findOne({ where: { owner_user_id: uid } });
            return tenant?.id ?? null;
        }, (tenantId) => tenantId !== null);
    }
    async ensureForUser(userId) {
        const existing = await this.resolve(userId);
        if (existing)
            return existing;
        const id = (0, crypto_1.randomUUID)();
        try {
            await this.tenantRepo.insert({ id, name: userId, owner_user_id: userId, is_active: true });
            this.cache.invalidate(userId);
            return id;
        }
        catch (err) {
            this.cache.invalidate(userId);
            const raced = await this.tenantRepo.findOne({ where: { owner_user_id: userId } });
            if (raced)
                return raced.id;
            throw err;
        }
    }
    invalidate(userId) {
        this.cache.invalidate(userId);
    }
};
exports.TenantCacheService = TenantCacheService;
exports.TenantCacheService = TenantCacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantCacheService);
//# sourceMappingURL=tenant-cache.service.js.map