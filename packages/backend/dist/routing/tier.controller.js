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
exports.TierController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manifest_shared_1 = require("manifest-shared");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const tier_service_1 = require("./routing-core/tier.service");
const resolve_agent_service_1 = require("./routing-core/resolve-agent.service");
const routing_dto_1 = require("./dto/routing.dto");
const uuid_1 = require("uuid");
const agent_entity_1 = require("../entities/agent.entity");
const install_metadata_entity_1 = require("../entities/install-metadata.entity");
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
const autofix_service_1 = require("./autofix/autofix.service");
const agent_recording_config_service_1 = require("../common/services/agent-recording-config.service");
let TierController = class TierController {
    tierService;
    resolveAgentService;
    agentRepo;
    installMetadataRepo;
    autofixService;
    recordingConfig;
    cacheManager;
    constructor(tierService, resolveAgentService, agentRepo, installMetadataRepo, autofixService, recordingConfig, cacheManager) {
        this.tierService = tierService;
        this.resolveAgentService = resolveAgentService;
        this.agentRepo = agentRepo;
        this.installMetadataRepo = installMetadataRepo;
        this.autofixService = autofixService;
        this.recordingConfig = recordingConfig;
        this.cacheManager = cacheManager;
    }
    async getTiers(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        return this.tierService.getTiers(agent.id, agent.tenant_id);
    }
    async setOverride(ctx, agentName, tier, body) {
        this.validateTier(tier);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        const model = body.route?.model ?? body.model;
        const provider = body.route?.provider ?? body.provider;
        const authType = body.route?.authType ?? body.authType;
        const providerKeyLabel = body.route?.keyLabel ?? body.providerKeyLabel;
        return this.tierService.setOverride(agent.id, agent.tenant_id, tier, model, provider, authType, providerKeyLabel);
    }
    async clearOverride(ctx, agentName, tier) {
        this.validateTier(tier);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.tierService.clearOverride(agent.id, tier);
        return { ok: true };
    }
    async setResponseMode(ctx, agentName, tier, body) {
        this.validateTier(tier);
        const responseMode = (0, routing_dto_1.responseModeFromDto)(body);
        if (!responseMode)
            throw new common_1.BadRequestException('response_mode is required');
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.tierService.setResponseMode(agent.id, tier, responseMode);
    }
    async resetAllOverrides(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        await this.tierService.resetAllOverrides(agent.id);
        return { ok: true };
    }
    async getFallbacks(ctx, agentName, tier) {
        this.validateTier(tier);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.tierService.getFallbacks(agent.id, tier);
    }
    async setFallbacks(ctx, agentName, tier, body) {
        this.validateTier(tier);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.tierService.setFallbacks(agent.id, agent.tenant_id, tier, body.models, body.routes);
    }
    async clearFallbacks(ctx, agentName, tier) {
        this.validateTier(tier);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.tierService.clearFallbacks(agent.id, tier);
        return { ok: true };
    }
    async getComplexityStatus(ctx, agentName) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return { enabled: agent.complexity_routing_enabled };
    }
    async toggleComplexity(ctx, agentName) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        const newValue = !agent.complexity_routing_enabled;
        await this.agentRepo.update(agent.id, { complexity_routing_enabled: newValue });
        this.resolveAgentService.invalidate(agent.tenant_id, agentName);
        return { enabled: newValue };
    }
    async getAutofix(ctx, agentName) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return {
            enabled: this.autofixService.resolveEnabled(agent.autofix_enabled),
            consented: await this.hasAutofixConsent(),
        };
    }
    async updateAutofix(ctx, agentName, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        const applied = typeof body.enabled === 'boolean';
        if (applied) {
            await this.agentRepo.update(agent.id, { autofix_enabled: body.enabled });
            this.resolveAgentService.invalidate(agent.tenant_id, agentName);
            if (body.enabled) {
                if (!(await this.hasAutofixConsent()))
                    await this.recordAutofixConsent();
            }
            if (agent.tenant_id) {
                await this.cacheManager.del(`${agent.tenant_id}:/api/v1/autofix/status`);
            }
        }
        return {
            enabled: applied
                ? body.enabled
                : this.autofixService.resolveEnabled(agent.autofix_enabled),
            consented: await this.hasAutofixConsent(),
        };
    }
    async hasAutofixConsent() {
        if (!(0, detect_self_hosted_1.isSelfHosted)())
            return true;
        const row = await this.installMetadataRepo.findOne({ where: { id: 'singleton' } });
        return row?.autofix_consented_at != null;
    }
    async recordAutofixConsent() {
        await this.installMetadataRepo
            .createQueryBuilder()
            .insert()
            .into(install_metadata_entity_1.InstallMetadata)
            .values({
            id: 'singleton',
            install_id: (0, uuid_1.v4)(),
            autofix_consented_at: new Date().toISOString(),
        })
            .orUpdate(['autofix_consented_at'], ['id'])
            .execute();
    }
    async getRecording(ctx, agentName) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return { enabled: await this.recordingConfig.isRecording(agent.id) };
    }
    async updateRecording(ctx, agentName, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        if (typeof body.enabled !== 'boolean') {
            return { enabled: await this.recordingConfig.isRecording(agent.id) };
        }
        await this.agentRepo.update(agent.id, { record_messages: body.enabled });
        this.resolveAgentService.invalidate(agent.tenant_id, agentName);
        return { enabled: body.enabled };
    }
    validateTier(tier) {
        if (!manifest_shared_1.TIER_SLOTS.includes(tier)) {
            throw new common_1.BadRequestException(`Invalid tier: ${tier}. Must be one of: ${manifest_shared_1.TIER_SLOTS.join(', ')}`);
        }
    }
};
exports.TierController = TierController;
__decorate([
    (0, common_1.Get)(':agentName/tiers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "getTiers", null);
__decorate([
    (0, common_1.Put)(':agentName/tiers/:tier'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tier')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, routing_dto_1.SetOverrideDto]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "setOverride", null);
__decorate([
    (0, common_1.Delete)(':agentName/tiers/:tier'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "clearOverride", null);
__decorate([
    (0, common_1.Patch)(':agentName/tiers/:tier/response-mode'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tier')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, routing_dto_1.SetResponseModeDto]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "setResponseMode", null);
__decorate([
    (0, common_1.Post)(':agentName/tiers/reset-all'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "resetAllOverrides", null);
__decorate([
    (0, common_1.Get)(':agentName/tiers/:tier/fallbacks'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "getFallbacks", null);
__decorate([
    (0, common_1.Put)(':agentName/tiers/:tier/fallbacks'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tier')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, routing_dto_1.SetFallbacksDto]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "setFallbacks", null);
__decorate([
    (0, common_1.Delete)(':agentName/tiers/:tier/fallbacks'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('tier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "clearFallbacks", null);
__decorate([
    (0, common_1.Get)(':agentName/complexity/status'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "getComplexityStatus", null);
__decorate([
    (0, common_1.Post)(':agentName/complexity/toggle'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "toggleComplexity", null);
__decorate([
    (0, common_1.Get)(':agentName/autofix'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "getAutofix", null);
__decorate([
    (0, common_1.Patch)(':agentName/autofix'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, routing_dto_1.UpdateAutofixDto]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "updateAutofix", null);
__decorate([
    (0, common_1.Get)(':agentName/recording'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "getRecording", null);
__decorate([
    (0, common_1.Patch)(':agentName/recording'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, routing_dto_1.UpdateRecordingDto]),
    __metadata("design:returntype", Promise)
], TierController.prototype, "updateRecording", null);
exports.TierController = TierController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __param(2, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(3, (0, typeorm_1.InjectRepository)(install_metadata_entity_1.InstallMetadata)),
    __param(6, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [tier_service_1.TierService,
        resolve_agent_service_1.ResolveAgentService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        autofix_service_1.AutofixService,
        agent_recording_config_service_1.AgentRecordingConfigService, Object])
], TierController);
//# sourceMappingURL=tier.controller.js.map