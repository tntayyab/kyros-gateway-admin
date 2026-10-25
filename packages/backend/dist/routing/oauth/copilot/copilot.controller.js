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
exports.CopilotController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../../../common/decorators/tenant-context.decorator");
const provider_service_1 = require("../../routing-core/provider.service");
const resolve_agent_service_1 = require("../../routing-core/resolve-agent.service");
const copilot_device_auth_service_1 = require("./copilot-device-auth.service");
const model_discovery_service_1 = require("../../../model-discovery/model-discovery.service");
const routing_dto_1 = require("../../dto/routing.dto");
let CopilotController = class CopilotController {
    providerService;
    resolveAgentService;
    copilotAuth;
    discoveryService;
    constructor(providerService, resolveAgentService, copilotAuth, discoveryService) {
        this.providerService = providerService;
        this.resolveAgentService = resolveAgentService;
        this.copilotAuth = copilotAuth;
        this.discoveryService = discoveryService;
    }
    async copilotDeviceCode(ctx, params) {
        await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        return this.copilotAuth.requestDeviceCode();
    }
    async copilotPollToken(ctx, params, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        const result = await this.copilotAuth.pollForToken(body.deviceCode);
        if (result.status === 'complete' && result.token) {
            const label = await this.providerService.nextOAuthLabel(agent.tenant_id, 'copilot');
            const { provider: record } = await this.providerService.upsertProvider(agent.id, agent.tenant_id, 'copilot', result.token, 'subscription', undefined, label, ctx.userId);
            try {
                await this.discoveryService.discoverModels(record);
            }
            catch {
            }
        }
        return { status: result.status };
    }
};
exports.CopilotController = CopilotController;
__decorate([
    (0, common_1.Post)(':agentName/copilot/device-code'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "copilotDeviceCode", null);
__decorate([
    (0, common_1.Post)(':agentName/copilot/poll-token'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, routing_dto_1.AgentNameParamDto,
        routing_dto_1.CopilotPollDto]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "copilotPollToken", null);
exports.CopilotController = CopilotController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        resolve_agent_service_1.ResolveAgentService,
        copilot_device_auth_service_1.CopilotDeviceAuthService,
        model_discovery_service_1.ModelDiscoveryService])
], CopilotController);
//# sourceMappingURL=copilot.controller.js.map