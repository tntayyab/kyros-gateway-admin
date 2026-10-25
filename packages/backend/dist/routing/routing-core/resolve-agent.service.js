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
exports.ResolveAgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_entity_1 = require("../../entities/agent.entity");
const TTL_MS = 120_000;
const MAX_ENTRIES = 5_000;
let ResolveAgentService = class ResolveAgentService {
    agentRepo;
    cache = new Map();
    constructor(agentRepo) {
        this.agentRepo = agentRepo;
    }
    async resolve(tenantId, agentName, options = {}) {
        if (!tenantId)
            throw new common_1.NotFoundException('Tenant not found');
        const cacheKey = `${tenantId}:${agentName}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            if (cached.agent.is_playground && !options.allowPlayground) {
                throw new common_1.NotFoundException(`Agent "${agentName}" not found`);
            }
            return cached.agent;
        }
        if (cached)
            this.cache.delete(cacheKey);
        const agent = await this.agentRepo.findOne({
            where: { tenant_id: tenantId, name: agentName, deleted_at: (0, typeorm_2.IsNull)() },
        });
        if (!agent)
            throw new common_1.NotFoundException(`Agent "${agentName}" not found`);
        if (agent.is_playground && !options.allowPlayground) {
            throw new common_1.NotFoundException(`Agent "${agentName}" not found`);
        }
        if (this.cache.size >= MAX_ENTRIES && !this.cache.has(cacheKey)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined)
                this.cache.delete(firstKey);
        }
        this.cache.set(cacheKey, { agent, expiresAt: Date.now() + TTL_MS });
        return agent;
    }
    invalidate(tenantId, agentName) {
        this.cache.delete(`${tenantId}:${agentName}`);
    }
    invalidateTenant(tenantId) {
        const prefix = `${tenantId}:`;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix))
                this.cache.delete(key);
        }
    }
};
exports.ResolveAgentService = ResolveAgentService;
exports.ResolveAgentService = ResolveAgentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResolveAgentService);
//# sourceMappingURL=resolve-agent.service.js.map