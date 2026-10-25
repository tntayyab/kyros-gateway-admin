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
exports.CustomProviderController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const custom_provider_service_1 = require("./custom-provider.service");
const provider_service_1 = require("../routing-core/provider.service");
const resolve_agent_service_1 = require("../routing-core/resolve-agent.service");
const custom_provider_dto_1 = require("../dto/custom-provider.dto");
const routing_dto_1 = require("../dto/routing.dto");
let CustomProviderController = class CustomProviderController {
    customProviderService;
    providerService;
    resolveAgentService;
    constructor(customProviderService, providerService, resolveAgentService) {
        this.customProviderService = customProviderService;
        this.providerService = providerService;
        this.resolveAgentService = resolveAgentService;
    }
    async list(ctx, params) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName, {
            allowPlayground: true,
        });
        const [providers, tenantProviders] = await Promise.all([
            this.customProviderService.list(agent.tenant_id),
            this.providerService.getProviders(agent.tenant_id),
        ]);
        if (providers.length === 0)
            return [];
        return providers.map((cp) => {
            const up = (0, custom_provider_service_1.primaryCustomConnection)(tenantProviders, custom_provider_service_1.CustomProviderService.providerKey(cp.id));
            return {
                id: cp.id,
                name: cp.name,
                alias: cp.alias,
                base_url: cp.base_url,
                api_kind: cp.api_kind,
                has_api_key: !!up?.api_key_encrypted,
                models: cp.models,
                created_at: cp.created_at,
            };
        });
    }
    async probe(ctx, agentName, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        const apiKey = body.apiKey ??
            (body.provider_id
                ? await this.customProviderService.loadStoredApiKey(agent.tenant_id, body.provider_id, body.base_url, body.api_kind)
                : undefined);
        const models = await this.customProviderService.probeModels(body.base_url, apiKey, body.api_kind, body.provider_name);
        return { models };
    }
    async create(ctx, params, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName, {
            allowPlayground: true,
        });
        const cp = await this.customProviderService.create(agent.tenant_id, body, ctx.userId);
        const provKey = custom_provider_service_1.CustomProviderService.providerKey(cp.id);
        const up = (await this.providerService.getProviders(agent.tenant_id)).find((u) => u.provider === provKey);
        return {
            id: cp.id,
            name: cp.name,
            alias: cp.alias,
            base_url: cp.base_url,
            api_kind: cp.api_kind,
            has_api_key: !!up?.api_key_encrypted,
            models: cp.models,
            created_at: cp.created_at,
        };
    }
    async update(ctx, agentName, id, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        const cp = await this.customProviderService.update(id, agent.tenant_id, body, ctx.userId);
        const provKey = custom_provider_service_1.CustomProviderService.providerKey(cp.id);
        const up = (await this.providerService.getProviders(agent.tenant_id)).find((u) => u.provider === provKey);
        return {
            id: cp.id,
            name: cp.name,
            alias: cp.alias,
            base_url: cp.base_url,
            api_kind: cp.api_kind,
            has_api_key: !!up?.api_key_encrypted,
            models: cp.models,
            created_at: cp.created_at,
        };
    }
    async remove(ctx, agentName, id) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, agentName);
        await this.customProviderService.remove(agent.tenant_id, id, ctx.userId);
        return { ok: true };
    }
};
exports.CustomProviderController = CustomProviderController;
__decorate([
    (0, common_1.Get)(':agentName/custom-providers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], CustomProviderController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':agentName/custom-providers/probe'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, custom_provider_dto_1.ProbeCustomProviderDto]),
    __metadata("design:returntype", Promise)
], CustomProviderController.prototype, "probe", null);
__decorate([
    (0, common_1.Post)(':agentName/custom-providers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto,
        custom_provider_dto_1.CreateCustomProviderDto]),
    __metadata("design:returntype", Promise)
], CustomProviderController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':agentName/custom-providers/:id'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, custom_provider_dto_1.UpdateCustomProviderDto]),
    __metadata("design:returntype", Promise)
], CustomProviderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':agentName/custom-providers/:id'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CustomProviderController.prototype, "remove", null);
exports.CustomProviderController = CustomProviderController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [custom_provider_service_1.CustomProviderService,
        provider_service_1.ProviderService,
        resolve_agent_service_1.ResolveAgentService])
], CustomProviderController);
//# sourceMappingURL=custom-provider.controller.js.map