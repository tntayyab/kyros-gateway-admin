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
exports.PlaygroundAgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const agent_entity_1 = require("../entities/agent.entity");
const tenant_cache_service_1 = require("../common/services/tenant-cache.service");
const playground_constants_1 = require("../common/constants/playground.constants");
let PlaygroundAgentService = class PlaygroundAgentService {
    agentRepo;
    tenantCache;
    dataSource;
    constructor(agentRepo, tenantCache, dataSource) {
        this.agentRepo = agentRepo;
        this.tenantCache = tenantCache;
        this.dataSource = dataSource;
    }
    async resolve(ctx) {
        let tenantId = ctx.tenantId;
        if (!tenantId) {
            if (!ctx.userId)
                throw new common_1.NotFoundException('Tenant not found');
            tenantId = await this.tenantCache.ensureForUser(ctx.userId);
        }
        const existing = await this.findPlaygroundAgent(tenantId);
        if (existing)
            return existing;
        const agent = Object.assign(new agent_entity_1.Agent(), {
            id: (0, crypto_1.randomUUID)(),
            name: playground_constants_1.PLAYGROUND_AGENT_NAME,
            display_name: playground_constants_1.PLAYGROUND_AGENT_NAME,
            is_playground: true,
            is_active: true,
            tenant_id: tenantId,
        });
        try {
            await this.dataSource.transaction(async (manager) => {
                await manager.getRepository(agent_entity_1.Agent).insert(agent);
                await manager.query(`INSERT INTO "agent_enabled_providers" ("agent_id","tenant_provider_id") ` +
                    `SELECT $1, "id" FROM "tenant_providers" WHERE "tenant_id" = $2 ON CONFLICT DO NOTHING`, [agent.id, tenantId]);
            });
        }
        catch (err) {
            const raced = await this.findPlaygroundAgent(tenantId);
            if (raced)
                return raced;
            throw err;
        }
        return agent;
    }
    findPlaygroundAgent(tenantId) {
        return this.agentRepo.findOne({
            where: { tenant_id: tenantId, is_playground: true, deleted_at: (0, typeorm_2.IsNull)() },
        });
    }
};
exports.PlaygroundAgentService = PlaygroundAgentService;
exports.PlaygroundAgentService = PlaygroundAgentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_cache_service_1.TenantCacheService,
        typeorm_2.DataSource])
], PlaygroundAgentService);
//# sourceMappingURL=playground-agent.service.js.map