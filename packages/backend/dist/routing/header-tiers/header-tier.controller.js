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
exports.HeaderTierController = exports.FallbacksBody = exports.OverrideBody = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const resolve_agent_service_1 = require("../routing-core/resolve-agent.service");
const routing_dto_1 = require("../dto/routing.dto");
const header_tier_service_1 = require("./header-tier.service");
const manifest_shared_1 = require("manifest-shared");
class OverrideBody {
    model;
    provider;
    authType;
    providerKeyLabel;
    route;
}
exports.OverrideBody = OverrideBody;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OverrideBody.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OverrideBody.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], OverrideBody.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(routing_dto_1.MAX_PROVIDER_KEY_LABEL_LENGTH),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], OverrideBody.prototype, "providerKeyLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => routing_dto_1.ModelRouteDto),
    __metadata("design:type", routing_dto_1.ModelRouteDto)
], OverrideBody.prototype, "route", void 0);
class FallbacksBody {
    models;
    routes;
}
exports.FallbacksBody = FallbacksBody;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FallbacksBody.prototype, "models", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(5),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => routing_dto_1.ModelRouteDto),
    __metadata("design:type", Array)
], FallbacksBody.prototype, "routes", void 0);
let HeaderTierController = class HeaderTierController {
    headerTierService;
    resolveAgentService;
    constructor(headerTierService, resolveAgentService) {
        this.headerTierService = headerTierService;
        this.resolveAgentService = resolveAgentService;
    }
    async list(ctx, agentName) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.headerTierService.list(agent.id);
    }
    async create(ctx, agentName, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.headerTierService.create(agent.id, agent.tenant_id, body);
    }
    async update(ctx, agentName, id, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.headerTierService.update(agent.id, id, body);
    }
    async toggle(ctx, agentName, id, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.headerTierService.setEnabled(agent.id, id, body.enabled);
    }
    async setResponseMode(ctx, agentName, id, body) {
        const responseMode = (0, routing_dto_1.responseModeFromDto)(body);
        if (!responseMode)
            throw new common_1.BadRequestException('response_mode is required');
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.headerTierService.setResponseMode(agent.id, id, responseMode);
    }
    async delete(ctx, agentName, id) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.headerTierService.delete(agent.id, id);
        return { ok: true };
    }
    async reorder(ctx, agentName, body) {
        if (!body || !Array.isArray(body.ids)) {
            throw new common_1.BadRequestException('reorder: body.ids must be an array');
        }
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.headerTierService.reorder(agent.id, body.ids);
        return { ok: true };
    }
    async setOverride(ctx, agentName, id, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        const model = body.route?.model ?? body.model;
        const provider = body.route?.provider ?? body.provider;
        const authType = body.route?.authType ?? body.authType;
        const providerKeyLabel = body.route?.keyLabel ?? body.providerKeyLabel;
        return this.headerTierService.setOverride(agent.id, agent.tenant_id, id, model, provider, authType, providerKeyLabel);
    }
    async clearOverride(ctx, agentName, id) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.headerTierService.clearOverride(agent.id, id);
        return { ok: true };
    }
    async setFallbacks(ctx, agentName, id, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        return this.headerTierService.setFallbacks(agent.id, agent.tenant_id, id, body.models, body.routes);
    }
    async clearFallbacks(ctx, agentName, id) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.headerTierService.clearFallbacks(agent.id, id);
        return { ok: true };
    }
};
exports.HeaderTierController = HeaderTierController;
__decorate([
    (0, common_1.Get)(':agentName/header-tiers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':agentName/header-tiers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':agentName/header-tiers/:id'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':agentName/header-tiers/:id/toggle'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "toggle", null);
__decorate([
    (0, common_1.Patch)(':agentName/header-tiers/:id/response-mode'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, routing_dto_1.SetResponseModeDto]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "setResponseMode", null);
__decorate([
    (0, common_1.Delete)(':agentName/header-tiers/:id'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':agentName/header-tiers/reorder'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "reorder", null);
__decorate([
    (0, common_1.Put)(':agentName/header-tiers/:id/override'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, OverrideBody]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "setOverride", null);
__decorate([
    (0, common_1.Delete)(':agentName/header-tiers/:id/override'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "clearOverride", null);
__decorate([
    (0, common_1.Put)(':agentName/header-tiers/:id/fallbacks'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, FallbacksBody]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "setFallbacks", null);
__decorate([
    (0, common_1.Delete)(':agentName/header-tiers/:id/fallbacks'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HeaderTierController.prototype, "clearFallbacks", null);
exports.HeaderTierController = HeaderTierController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [header_tier_service_1.HeaderTierService,
        resolve_agent_service_1.ResolveAgentService])
], HeaderTierController);
//# sourceMappingURL=header-tier.controller.js.map