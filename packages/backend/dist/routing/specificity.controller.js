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
exports.SpecificityController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const specificity_service_1 = require("./routing-core/specificity.service");
const resolve_agent_service_1 = require("./routing-core/resolve-agent.service");
const routing_dto_1 = require("./dto/routing.dto");
const specificity_dto_1 = require("./dto/specificity.dto");
const manifest_shared_1 = require("manifest-shared");
let SpecificityController = class SpecificityController {
    specificityService;
    resolveAgentService;
    constructor(specificityService, resolveAgentService) {
        this.specificityService = specificityService;
        this.resolveAgentService = resolveAgentService;
    }
    async getAssignments(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        return this.specificityService.getAssignments(agent.id);
    }
    async setOverride(ctx, agentName, category, body) {
        this.validateCategory(category);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        const model = body.route?.model ?? body.model;
        const provider = body.route?.provider ?? body.provider;
        const authType = body.route?.authType ?? body.authType;
        const providerKeyLabel = body.route?.keyLabel ?? body.providerKeyLabel;
        return this.specificityService.setOverride(agent.id, agent.tenant_id, category, model, provider, authType, providerKeyLabel);
    }
    async toggleCategory(ctx, agentName, category, body) {
        this.validateCategory(category);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.specificityService.toggleCategory(agent.id, category, body.active);
    }
    async clearOverride(ctx, agentName, category) {
        this.validateCategory(category);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.specificityService.clearOverride(agent.id, category);
        return { ok: true };
    }
    async setResponseMode(ctx, agentName, category, body) {
        this.validateCategory(category);
        const responseMode = (0, routing_dto_1.responseModeFromDto)(body);
        if (!responseMode)
            throw new common_1.BadRequestException('response_mode is required');
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.specificityService.setResponseMode(agent.id, category, responseMode);
    }
    async setFallbacks(ctx, agentName, category, body) {
        this.validateCategory(category);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.specificityService.setFallbacks(agent.id, agent.tenant_id, category, body.models, body.routes);
    }
    async clearFallbacks(ctx, agentName, category) {
        this.validateCategory(category);
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.specificityService.clearFallbacks(agent.id, category);
        return { ok: true };
    }
    async resetAll(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        await this.specificityService.resetAll(agent.id);
        return { ok: true };
    }
    validateCategory(category) {
        if (!manifest_shared_1.SPECIFICITY_CATEGORIES.includes(category)) {
            throw new common_1.BadRequestException(`Invalid category: ${category}. Must be one of: ${manifest_shared_1.SPECIFICITY_CATEGORIES.join(', ')}`);
        }
    }
};
exports.SpecificityController = SpecificityController;
__decorate([
    (0, common_1.Get)(':agentName/specificity'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "getAssignments", null);
__decorate([
    (0, common_1.Put)(':agentName/specificity/:category'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('category')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, specificity_dto_1.SetSpecificityOverrideDto]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "setOverride", null);
__decorate([
    (0, common_1.Post)(':agentName/specificity/:category/toggle'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('category')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, specificity_dto_1.ToggleSpecificityDto]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "toggleCategory", null);
__decorate([
    (0, common_1.Delete)(':agentName/specificity/:category'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "clearOverride", null);
__decorate([
    (0, common_1.Patch)(':agentName/specificity/:category/response-mode'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('category')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, routing_dto_1.SetResponseModeDto]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "setResponseMode", null);
__decorate([
    (0, common_1.Put)(':agentName/specificity/:category/fallbacks'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('category')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, routing_dto_1.SetFallbacksDto]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "setFallbacks", null);
__decorate([
    (0, common_1.Delete)(':agentName/specificity/:category/fallbacks'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "clearFallbacks", null);
__decorate([
    (0, common_1.Post)(':agentName/specificity/reset-all'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], SpecificityController.prototype, "resetAll", null);
exports.SpecificityController = SpecificityController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [specificity_service_1.SpecificityService,
        resolve_agent_service_1.ResolveAgentService])
], SpecificityController);
//# sourceMappingURL=specificity.controller.js.map