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
exports.AgentEnabledProvidersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const agent_entity_1 = require("../entities/agent.entity");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const tier_assignment_entity_1 = require("../entities/tier-assignment.entity");
const specificity_assignment_entity_1 = require("../entities/specificity-assignment.entity");
const header_tier_entity_1 = require("../entities/header-tier.entity");
const provider_service_1 = require("./routing-core/provider.service");
let AgentEnabledProvidersController = class AgentEnabledProvidersController {
    enabledProviderRepo;
    agentRepo;
    tenantProviderRepo;
    tierRepo;
    specificityRepo;
    headerTierRepo;
    providerService;
    constructor(enabledProviderRepo, agentRepo, tenantProviderRepo, tierRepo, specificityRepo, headerTierRepo, providerService) {
        this.enabledProviderRepo = enabledProviderRepo;
        this.agentRepo = agentRepo;
        this.tenantProviderRepo = tenantProviderRepo;
        this.tierRepo = tierRepo;
        this.specificityRepo = specificityRepo;
        this.headerTierRepo = headerTierRepo;
        this.providerService = providerService;
    }
    async resolveAgent(agentName, tenantId) {
        if (!tenantId)
            return null;
        return this.agentRepo.findOne({
            where: {
                name: decodeURIComponent(agentName),
                tenant_id: tenantId,
                is_playground: false,
                deleted_at: (0, typeorm_2.IsNull)(),
            },
        });
    }
    async listEnabled(ctx, agentName) {
        const agent = await this.resolveAgent(agentName, ctx.tenantId);
        if (!agent)
            return { enabled: [] };
        const rows = await this.enabledProviderRepo.find({ where: { agent_id: agent.id } });
        return { enabled: rows.map((r) => r.tenant_provider_id) };
    }
    async getDisableImpact(ctx, agentName, tenantProviderId) {
        const agent = await this.resolveAgent(agentName, ctx.tenantId);
        if (!agent)
            throw new common_1.HttpException('Agent not found', common_1.HttpStatus.NOT_FOUND);
        const provider = await this.tenantProviderRepo.findOne({
            where: { id: tenantProviderId, tenant_id: agent.tenant_id },
        });
        if (!provider)
            throw new common_1.HttpException('Provider not found', common_1.HttpStatus.NOT_FOUND);
        return { affected_tiers: await this.findAffectedRoutes(agent.id, provider) };
    }
    async findAffectedRoutes(agentId, provider) {
        const providerModels = new Set((Array.isArray(provider.cached_models) ? provider.cached_models : []).map((m) => m.id));
        const providerName = provider.provider.toLowerCase();
        const providerAuthType = provider.auth_type;
        const providerLabel = provider.label?.toLowerCase();
        const routeBelongsToDisabledProvider = (route) => {
            if (!route)
                return false;
            if (route.provider) {
                if (route.provider.toLowerCase() !== providerName)
                    return false;
                if (route.authType && route.authType !== providerAuthType)
                    return false;
                if (route.keyLabel && providerLabel && route.keyLabel.toLowerCase() !== providerLabel) {
                    return false;
                }
                if (!route.keyLabel && provider.priority !== 0 && providerLabel !== 'default') {
                    return false;
                }
                return true;
            }
            return providerModels.has(route.model);
        };
        const tiers = await this.tierRepo.find({ where: { agent_id: agentId } });
        const affected = [];
        for (const tier of tiers) {
            if (routeBelongsToDisabledProvider(tier.override_route)) {
                affected.push({ tier: tier.tier, model: tier.override_route.model, position: 'primary' });
            }
            for (const [i, fb] of (tier.fallback_routes ?? []).entries()) {
                if (routeBelongsToDisabledProvider(fb)) {
                    affected.push({ tier: tier.tier, model: fb.model, position: `fallback ${i + 1}` });
                }
            }
        }
        const specificityRows = await this.specificityRepo.find({ where: { agent_id: agentId } });
        for (const assignment of specificityRows) {
            if (routeBelongsToDisabledProvider(assignment.override_route)) {
                affected.push({
                    tier: assignment.category,
                    model: assignment.override_route.model,
                    position: 'primary',
                });
            }
            for (const [i, fb] of (assignment.fallback_routes ?? []).entries()) {
                if (routeBelongsToDisabledProvider(fb)) {
                    affected.push({
                        tier: assignment.category,
                        model: fb.model,
                        position: `fallback ${i + 1}`,
                    });
                }
            }
        }
        const headerTiers = await this.headerTierRepo.find({ where: { agent_id: agentId } });
        for (const tier of headerTiers) {
            if (routeBelongsToDisabledProvider(tier.override_route)) {
                affected.push({ tier: tier.name, model: tier.override_route.model, position: 'primary' });
            }
            for (const [i, fb] of (tier.fallback_routes ?? []).entries()) {
                if (routeBelongsToDisabledProvider(fb)) {
                    affected.push({ tier: tier.name, model: fb.model, position: `fallback ${i + 1}` });
                }
            }
        }
        return affected;
    }
    async enable(ctx, agentName, tenantProviderId) {
        const agent = await this.resolveAgent(agentName, ctx.tenantId);
        if (!agent)
            throw new common_1.HttpException('Agent not found', common_1.HttpStatus.NOT_FOUND);
        const provider = await this.tenantProviderRepo.findOne({
            where: { id: tenantProviderId, tenant_id: agent.tenant_id },
        });
        if (!provider)
            throw new common_1.HttpException('Provider not found', common_1.HttpStatus.NOT_FOUND);
        await this.enabledProviderRepo
            .createQueryBuilder()
            .insert()
            .into(agent_enabled_provider_entity_1.AgentEnabledProvider)
            .values({ agent_id: agent.id, tenant_provider_id: tenantProviderId })
            .orIgnore()
            .execute();
        await this.providerService.recalculateTiers(agent.id, agent.tenant_id);
        return { ok: true };
    }
    async disable(ctx, agentName, tenantProviderId) {
        const agent = await this.resolveAgent(agentName, ctx.tenantId);
        if (!agent)
            throw new common_1.HttpException('Agent not found', common_1.HttpStatus.NOT_FOUND);
        const provider = await this.tenantProviderRepo.findOne({
            where: { id: tenantProviderId, tenant_id: agent.tenant_id },
        });
        if (provider) {
            const affected = await this.findAffectedRoutes(agent.id, provider);
            if (affected.length > 0) {
                throw new common_1.ConflictException("Can't disable provider while its models are assigned to this harness's routing. Update routing first.");
            }
        }
        await this.enabledProviderRepo.delete({
            agent_id: agent.id,
            tenant_provider_id: tenantProviderId,
        });
        await this.providerService.recalculateTiers(agent.id, agent.tenant_id);
        return { ok: true };
    }
};
exports.AgentEnabledProvidersController = AgentEnabledProvidersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentEnabledProvidersController.prototype, "listEnabled", null);
__decorate([
    (0, common_1.Get)(':tenantProviderId/impact'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tenantProviderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AgentEnabledProvidersController.prototype, "getDisableImpact", null);
__decorate([
    (0, common_1.Put)(':tenantProviderId'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tenantProviderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AgentEnabledProvidersController.prototype, "enable", null);
__decorate([
    (0, common_1.Delete)(':tenantProviderId'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tenantProviderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AgentEnabledProvidersController.prototype, "disable", null);
exports.AgentEnabledProvidersController = AgentEnabledProvidersController = __decorate([
    (0, common_1.Controller)('api/v1/agents/:agentName/enabled-providers'),
    __param(0, (0, typeorm_1.InjectRepository)(agent_enabled_provider_entity_1.AgentEnabledProvider)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(3, (0, typeorm_1.InjectRepository)(tier_assignment_entity_1.TierAssignment)),
    __param(4, (0, typeorm_1.InjectRepository)(specificity_assignment_entity_1.SpecificityAssignment)),
    __param(5, (0, typeorm_1.InjectRepository)(header_tier_entity_1.HeaderTier)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        provider_service_1.ProviderService])
], AgentEnabledProvidersController);
//# sourceMappingURL=agent-enabled-providers.controller.js.map