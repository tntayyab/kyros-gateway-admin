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
exports.ModelParamsController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const agent_model_params_service_1 = require("./routing-core/agent-model-params.service");
const provider_param_spec_service_1 = require("./routing-core/provider-param-spec.service");
const resolve_agent_service_1 = require("./routing-core/resolve-agent.service");
const routing_dto_1 = require("./dto/routing.dto");
const model_params_dto_1 = require("./dto/model-params.dto");
const sanitize_model_params_1 = require("./model-params/sanitize-model-params");
let ModelParamsController = class ModelParamsController {
    modelParamsService;
    providerParamSpecs;
    resolveAgentService;
    constructor(modelParamsService, providerParamSpecs, resolveAgentService) {
        this.modelParamsService = modelParamsService;
        this.providerParamSpecs = providerParamSpecs;
        this.resolveAgentService = resolveAgentService;
    }
    async specsByModel(ctx, params, query) {
        await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        return this.providerParamSpecs.getSpecs(query.provider, query.authType, query.model);
    }
    async specsIndex(ctx, params) {
        await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        return this.providerParamSpecs.listModelIds();
    }
    async list(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const rows = await this.modelParamsService.list(agent.id);
        return rows.map((r) => ({
            provider: r.provider,
            authType: r.auth_type,
            model: r.model_name,
            scope: r.scope_key,
            params: r.params,
        }));
    }
    async set(ctx, params, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const sanitized = await this.assertCompatibleParams(body.provider, body.authType, body.model, body.params);
        const saved = await this.modelParamsService.set(agent.id, body.scope, body.provider, body.authType, body.model, sanitized);
        return {
            provider: saved.provider,
            authType: saved.auth_type,
            model: saved.model_name,
            scope: saved.scope_key,
            params: saved.params,
        };
    }
    async remove(ctx, params, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        await this.modelParamsService.delete(agent.id, body.scope, body.provider, body.authType, body.model);
        return { ok: true };
    }
    async assertCompatibleParams(provider, authType, model, params) {
        const specs = await this.providerParamSpecs.getSpecs(provider, authType, model);
        return (0, sanitize_model_params_1.sanitizeModelParams)(provider, params, specs);
    }
};
exports.ModelParamsController = ModelParamsController;
__decorate([
    (0, common_1.Get)(':agentName/model-param-specs/by-model'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto,
        model_params_dto_1.ModelParamSpecsQueryDto]),
    __metadata("design:returntype", Promise)
], ModelParamsController.prototype, "specsByModel", null);
__decorate([
    (0, common_1.Get)(':agentName/model-param-specs/index'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], ModelParamsController.prototype, "specsIndex", null);
__decorate([
    (0, common_1.Get)(':agentName/model-params'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], ModelParamsController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(':agentName/model-params'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto,
        model_params_dto_1.SetModelParamsBodyDto]),
    __metadata("design:returntype", Promise)
], ModelParamsController.prototype, "set", null);
__decorate([
    (0, common_1.Delete)(':agentName/model-params'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto,
        model_params_dto_1.DeleteModelParamsBodyDto]),
    __metadata("design:returntype", Promise)
], ModelParamsController.prototype, "remove", null);
exports.ModelParamsController = ModelParamsController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [agent_model_params_service_1.AgentModelParamsService,
        provider_param_spec_service_1.ProviderParamSpecService,
        resolve_agent_service_1.ResolveAgentService])
], ModelParamsController);
//# sourceMappingURL=model-params.controller.js.map