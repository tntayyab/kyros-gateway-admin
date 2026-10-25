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
exports.MinimaxOauthController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../../../common/decorators/tenant-context.decorator");
const minimax_oauth_service_1 = require("./minimax-oauth.service");
const resolve_agent_service_1 = require("../../routing-core/resolve-agent.service");
const provider_service_1 = require("../../routing-core/provider.service");
const query_params_1 = require("../core/query-params");
let MinimaxOauthController = class MinimaxOauthController {
    oauthService;
    resolveAgent;
    providerService;
    constructor(oauthService, resolveAgent, providerService) {
        this.oauthService = oauthService;
        this.resolveAgent = resolveAgent;
        this.providerService = providerService;
    }
    async start(agentName, region, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (region && !(0, minimax_oauth_service_1.isMinimaxRegion)(region)) {
            throw new common_1.HttpException('region query parameter must be one of: global, cn', common_1.HttpStatus.BAD_REQUEST);
        }
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        const selectedRegion = region && (0, minimax_oauth_service_1.isMinimaxRegion)(region) ? region : 'global';
        try {
            return await this.oauthService.startAuthorization(agent.id, agent.tenant_id, selectedRegion, ctx.userId);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start MiniMax OAuth';
            throw new common_1.HttpException(message, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async poll(flowId, ctx) {
        if (!flowId) {
            throw new common_1.HttpException('flowId query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!ctx.tenantId) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        try {
            return await this.oauthService.pollAuthorization(flowId, ctx.tenantId);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to poll MiniMax OAuth';
            throw new common_1.HttpException(message, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async revoke(agentName, label, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const keyLabel = (0, query_params_1.optionalTrimmedStringQuery)(label, 'label');
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        const { notifications } = await this.providerService.removeProvider(agent.id, agent.tenant_id, 'minimax', 'subscription', keyLabel);
        return { ok: true, notifications };
    }
};
exports.MinimaxOauthController = MinimaxOauthController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, common_1.Query)('region')),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MinimaxOauthController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('poll'),
    __param(0, (0, common_1.Query)('flowId')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MinimaxOauthController.prototype, "poll", null);
__decorate([
    (0, common_1.Post)('revoke'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, common_1.Query)('label')),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MinimaxOauthController.prototype, "revoke", null);
exports.MinimaxOauthController = MinimaxOauthController = __decorate([
    (0, common_1.Controller)('api/v1/oauth/minimax'),
    __metadata("design:paramtypes", [minimax_oauth_service_1.MinimaxOauthService,
        resolve_agent_service_1.ResolveAgentService,
        provider_service_1.ProviderService])
], MinimaxOauthController);
//# sourceMappingURL=minimax-oauth.controller.js.map