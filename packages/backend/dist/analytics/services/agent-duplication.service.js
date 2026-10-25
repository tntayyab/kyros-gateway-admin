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
exports.AgentDuplicationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const agent_entity_1 = require("../../entities/agent.entity");
const agent_api_key_entity_1 = require("../../entities/agent-api-key.entity");
const agent_enabled_provider_entity_1 = require("../../entities/agent-enabled-provider.entity");
const tier_assignment_entity_1 = require("../../entities/tier-assignment.entity");
const specificity_assignment_entity_1 = require("../../entities/specificity-assignment.entity");
const agent_model_params_entity_1 = require("../../entities/agent-model-params.entity");
const hash_util_1 = require("../../common/utils/hash.util");
const crypto_util_1 = require("../../common/utils/crypto.util");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const api_key_constants_1 = require("../../common/constants/api-key.constants");
const routing_cache_service_1 = require("../../routing/routing-core/routing-cache.service");
let AgentDuplicationService = class AgentDuplicationService {
    agentRepo;
    dataSource;
    routingCache;
    constructor(agentRepo, dataSource, routingCache) {
        this.agentRepo = agentRepo;
        this.dataSource = dataSource;
        this.routingCache = routingCache;
    }
    generateOtlpKey() {
        return api_key_constants_1.API_KEY_PREFIX + (0, crypto_1.randomBytes)(32).toString('base64url');
    }
    async findOwnedAgent(tenantId, agentName) {
        if (!tenantId)
            return null;
        return (this.agentRepo
            .createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.name = :agentName', { agentName })
            .andWhere('a.deleted_at IS NULL')
            .andWhere('a.is_playground = false')
            .getOne());
    }
    async getCopySummary(tenantId, sourceName) {
        const source = await this.findOwnedAgent(tenantId, sourceName);
        if (!source)
            throw new common_1.NotFoundException(`Agent "${sourceName}" not found`);
        const [providers, tierAssignments, specificityAssignments, modelParams] = await Promise.all([
            this.dataSource.getRepository(agent_enabled_provider_entity_1.AgentEnabledProvider).count({ where: { agent_id: source.id } }),
            this.dataSource.getRepository(tier_assignment_entity_1.TierAssignment).count({ where: { agent_id: source.id } }),
            this.dataSource
                .getRepository(specificity_assignment_entity_1.SpecificityAssignment)
                .count({ where: { agent_id: source.id } }),
            this.dataSource.getRepository(agent_model_params_entity_1.AgentModelParams).count({ where: { agent_id: source.id } }),
        ]);
        return { providers, tierAssignments, specificityAssignments, modelParams };
    }
    async suggestName(tenantId, sourceName) {
        const source = await this.findOwnedAgent(tenantId, sourceName);
        if (!source)
            throw new common_1.NotFoundException(`Agent "${sourceName}" not found`);
        const existingNames = await this.agentRepo
            .createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId: source.tenant_id })
            .andWhere('a.deleted_at IS NULL')
            .select('a.name', 'name')
            .getRawMany();
        const taken = new Set(existingNames.map((r) => r.name));
        const base = `${sourceName}-copy`;
        if (!taken.has(base))
            return base;
        for (let i = 2; i <= 999; i++) {
            const candidate = `${base}-${i}`;
            if (!taken.has(candidate))
                return candidate;
        }
        return `${base}-${Date.now()}`;
    }
    async duplicate(tenantId, sourceName, params) {
        const source = await this.findOwnedAgent(tenantId, sourceName);
        if (!source)
            throw new common_1.NotFoundException(`Agent "${sourceName}" not found`);
        const clash = await this.findOwnedAgent(tenantId, params.name);
        if (clash)
            throw new common_1.ConflictException(`Agent "${params.name}" already exists`);
        const rawKey = this.generateOtlpKey();
        const secret = (0, crypto_util_1.getEncryptionSecret)();
        const newAgentId = (0, uuid_1.v4)();
        const now = (0, postgres_sql_1.sqlNow)();
        const copied = await this.dataSource.transaction(async (manager) => {
            await manager.getRepository(agent_entity_1.Agent).insert({
                id: newAgentId,
                name: params.name,
                display_name: params.displayName,
                description: source.description,
                agent_category: source.agent_category,
                agent_platform: source.agent_platform,
                complexity_routing_enabled: source.complexity_routing_enabled,
                is_active: true,
                tenant_id: source.tenant_id,
            });
            await manager.getRepository(agent_api_key_entity_1.AgentApiKey).insert({
                id: (0, uuid_1.v4)(),
                key: (0, crypto_util_1.encrypt)(rawKey, secret),
                key_hash: (0, hash_util_1.hashKey)(rawKey),
                key_prefix: (0, hash_util_1.keyPrefix)(rawKey),
                label: `${params.name} ingest key`,
                tenant_id: source.tenant_id,
                agent_id: newAgentId,
                is_active: true,
            });
            const sourceEnabledRows = await manager
                .getRepository(agent_enabled_provider_entity_1.AgentEnabledProvider)
                .find({ where: { agent_id: source.id } });
            if (sourceEnabledRows.length > 0) {
                await manager.getRepository(agent_enabled_provider_entity_1.AgentEnabledProvider).insert(sourceEnabledRows.map((g) => ({
                    agent_id: newAgentId,
                    tenant_provider_id: g.tenant_provider_id,
                })));
            }
            const providersEnabled = sourceEnabledRows.length;
            const tiers = await manager
                .getRepository(tier_assignment_entity_1.TierAssignment)
                .find({ where: { agent_id: source.id } });
            if (tiers.length > 0) {
                await manager.getRepository(tier_assignment_entity_1.TierAssignment).insert(tiers.map((t) => ({
                    id: (0, uuid_1.v4)(),
                    agent_id: newAgentId,
                    tier: t.tier,
                    override_route: t.override_route,
                    auto_assigned_route: t.auto_assigned_route,
                    fallback_routes: t.fallback_routes,
                    output_modality: t.output_modality,
                    response_mode: t.response_mode,
                    updated_at: now,
                })));
            }
            const specificity = await manager
                .getRepository(specificity_assignment_entity_1.SpecificityAssignment)
                .find({ where: { agent_id: source.id } });
            if (specificity.length > 0) {
                await manager.getRepository(specificity_assignment_entity_1.SpecificityAssignment).insert(specificity.map((s) => ({
                    id: (0, uuid_1.v4)(),
                    agent_id: newAgentId,
                    category: s.category,
                    is_active: s.is_active,
                    override_route: s.override_route,
                    auto_assigned_route: s.auto_assigned_route,
                    fallback_routes: s.fallback_routes,
                    output_modality: s.output_modality,
                    response_mode: s.response_mode,
                    updated_at: now,
                })));
            }
            const modelParams = await manager
                .getRepository(agent_model_params_entity_1.AgentModelParams)
                .find({ where: { agent_id: source.id } });
            if (modelParams.length > 0) {
                for (const p of modelParams) {
                    await manager.query(`
              INSERT INTO "agent_model_params" (
                "id", "agent_id", "scope_key", "provider",
                "auth_type", "model_name", "params", "created_at", "updated_at"
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                        (0, uuid_1.v4)(),
                        newAgentId,
                        p.scope_key,
                        p.provider,
                        p.auth_type,
                        p.model_name,
                        p.params,
                        now,
                        now,
                    ]);
                }
            }
            return {
                providers: providersEnabled,
                tierAssignments: tiers.length,
                specificityAssignments: specificity.length,
                modelParams: modelParams.length,
            };
        });
        this.routingCache.invalidateAgent(newAgentId);
        return {
            agentId: newAgentId,
            agentName: params.name,
            displayName: params.displayName,
            apiKey: rawKey,
            copied,
        };
    }
};
exports.AgentDuplicationService = AgentDuplicationService;
exports.AgentDuplicationService = AgentDuplicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        routing_cache_service_1.RoutingCacheService])
], AgentDuplicationService);
//# sourceMappingURL=agent-duplication.service.js.map