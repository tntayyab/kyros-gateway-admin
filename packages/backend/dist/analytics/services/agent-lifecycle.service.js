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
exports.AgentLifecycleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_entity_1 = require("../../entities/agent.entity");
const resolve_agent_service_1 = require("../../routing/routing-core/resolve-agent.service");
const routing_cache_service_1 = require("../../routing/routing-core/routing-cache.service");
const agent_key_auth_guard_1 = require("../../otlp/guards/agent-key-auth.guard");
let AgentLifecycleService = class AgentLifecycleService {
    agentRepo;
    dataSource;
    resolveAgent;
    routingCache;
    otlpAuthGuard;
    constructor(agentRepo, dataSource, resolveAgent, routingCache, otlpAuthGuard) {
        this.agentRepo = agentRepo;
        this.dataSource = dataSource;
        this.resolveAgent = resolveAgent;
        this.routingCache = routingCache;
        this.otlpAuthGuard = otlpAuthGuard;
    }
    async findAgentInfo(tenantId, agentName) {
        const agent = await this.findAgentByTenant(tenantId, agentName);
        if (!agent)
            return null;
        return {
            agent_name: agent.name,
            display_name: agent.display_name ?? agent.name,
            agent_category: agent.agent_category ?? null,
            agent_platform: agent.agent_platform ?? null,
        };
    }
    async deleteAgent(tenantId, agentName) {
        const agent = await this.findAgentByTenant(tenantId, agentName);
        if (!agent) {
            throw new common_1.NotFoundException(`Agent "${agentName}" not found`);
        }
        const { id: agentId, tenant_id: agentTenantId } = agent;
        await this.dataSource.transaction(async (manager) => {
            await manager
                .createQueryBuilder()
                .update('agents')
                .set({ deleted_at: () => 'NOW()', is_active: false })
                .where('id = :id', { id: agentId })
                .execute();
            await manager
                .createQueryBuilder()
                .update('agent_api_keys')
                .set({ is_active: false })
                .where('agent_id = :id', { id: agentId })
                .execute();
        });
        this.resolveAgent.invalidate(agentTenantId, agentName);
        this.routingCache.invalidateAgent(agentId);
        this.otlpAuthGuard.clearCache();
    }
    async findAgentByTenant(tenantId, agentName) {
        if (!tenantId)
            return null;
        return this.agentRepo
            .createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.name = :agentName', { agentName })
            .andWhere('a.deleted_at IS NULL')
            .andWhere('a.is_playground = false')
            .getOne();
    }
    async updateAgentType(tenantId, agentName, fields) {
        const agent = await this.findAgentByTenant(tenantId, agentName);
        if (!agent)
            throw new common_1.NotFoundException(`Agent "${agentName}" not found`);
        const update = {};
        if (fields.agent_category !== undefined)
            update['agent_category'] = fields.agent_category;
        if (fields.agent_platform !== undefined)
            update['agent_platform'] = fields.agent_platform;
        if (Object.keys(update).length === 0)
            return;
        await this.agentRepo
            .createQueryBuilder()
            .update('agents')
            .set(update)
            .where('id = :id', { id: agent.id })
            .execute();
    }
    async renameAgent(tenantId, currentName, newName, displayName) {
        const agent = await this.findAgentByTenant(tenantId, currentName);
        if (!agent) {
            throw new common_1.NotFoundException(`Agent "${currentName}" not found`);
        }
        if (newName === currentName) {
            if (displayName !== undefined) {
                await this.agentRepo
                    .createQueryBuilder()
                    .update('agents')
                    .set({ display_name: displayName })
                    .where('id = :id', { id: agent.id })
                    .execute();
            }
            return;
        }
        const duplicate = await this.agentRepo
            .createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId: agent.tenant_id })
            .andWhere('a.name = :newName', { newName })
            .andWhere('a.deleted_at IS NULL')
            .getOne();
        if (duplicate) {
            throw new common_1.ConflictException(`Agent "${newName}" already exists`);
        }
        await this.dataSource.transaction(async (manager) => {
            const agentUpdate = { name: newName };
            if (displayName !== undefined)
                agentUpdate['display_name'] = displayName;
            await manager
                .createQueryBuilder()
                .update('agents')
                .set(agentUpdate)
                .where('id = :id', { id: agent.id })
                .execute();
            const tenantScoped = ['agent_messages', 'requests', 'notification_rules'];
            await Promise.all(tenantScoped.map((table) => manager
                .createQueryBuilder()
                .update(table)
                .set({ agent_name: newName })
                .where('tenant_id = :tenantId AND agent_name = :currentName', {
                tenantId: agent.tenant_id,
                currentName,
            })
                .execute()));
            await manager.query(`UPDATE notification_logs SET agent_name = $1
         WHERE rule_id IN (
           SELECT id FROM notification_rules
           WHERE tenant_id = $2 AND agent_name = $1
         )`, [newName, agent.tenant_id]);
        });
    }
};
exports.AgentLifecycleService = AgentLifecycleService;
exports.AgentLifecycleService = AgentLifecycleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        resolve_agent_service_1.ResolveAgentService,
        routing_cache_service_1.RoutingCacheService,
        agent_key_auth_guard_1.AgentKeyAuthGuard])
], AgentLifecycleService);
//# sourceMappingURL=agent-lifecycle.service.js.map