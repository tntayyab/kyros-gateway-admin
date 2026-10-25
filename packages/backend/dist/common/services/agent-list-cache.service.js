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
var AgentListCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentListCacheService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const cache_constants_1 = require("../constants/cache.constants");
const ttl_cache_1 = require("../utils/ttl-cache");
const GENERATION_RESIDENCY_MS = cache_constants_1.AGENT_LIST_CACHE_TTL_MS * 2;
const GENERATION_MAX_TENANTS = 50_000;
let AgentListCacheService = AgentListCacheService_1 = class AgentListCacheService {
    cache;
    logger = new common_1.Logger(AgentListCacheService_1.name);
    generations = new ttl_cache_1.TtlCache({
        maxSize: GENERATION_MAX_TENANTS,
        ttlMs: GENERATION_RESIDENCY_MS,
    });
    nextGeneration = 0;
    constructor(cache) {
        this.cache = cache;
    }
    key(tenantId, includePlayground) {
        return (0, cache_constants_1.agentListCacheKey)(tenantId, includePlayground, this.generations.get(tenantId) ?? 0);
    }
    async invalidate(tenantId) {
        const retired = this.generations.get(tenantId) ?? 0;
        this.generations.set(tenantId, ++this.nextGeneration);
        await Promise.all([false, true].map(async (includePlayground) => {
            const key = (0, cache_constants_1.agentListCacheKey)(tenantId, includePlayground, retired);
            try {
                await this.cache.del(key);
            }
            catch (error) {
                this.logger.warn(`Could not delete the retired agent-list cache entry ${key}; it expires on its own`, error instanceof Error ? error.stack : String(error));
            }
        }));
    }
};
exports.AgentListCacheService = AgentListCacheService;
exports.AgentListCacheService = AgentListCacheService = AgentListCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], AgentListCacheService);
//# sourceMappingURL=agent-list-cache.service.js.map