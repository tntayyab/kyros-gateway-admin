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
var AnthropicOauthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicOauthController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../../../common/decorators/tenant-context.decorator");
const resolve_agent_service_1 = require("../../routing-core/resolve-agent.service");
const provider_service_1 = require("../../routing-core/provider.service");
const anthropic_oauth_service_1 = require("./anthropic-oauth.service");
const query_params_1 = require("../core/query-params");
let AnthropicOauthController = AnthropicOauthController_1 = class AnthropicOauthController {
    oauthService;
    resolveAgent;
    providerService;
    logger = new common_1.Logger(AnthropicOauthController_1.name);
    constructor(oauthService, resolveAgent, providerService) {
        this.oauthService = oauthService;
        this.resolveAgent = resolveAgent;
        this.providerService = providerService;
    }
    async authorize(agentName, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        return this.oauthService.generateAuthorizationUrl(agent.id, agent.tenant_id);
    }
    async exchange(agentName, code, state, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!code) {
            throw new common_1.HttpException('code is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        try {
            await this.oauthService.exchangeCode(code, state, agent.id, agent.tenant_id, ctx.userId);
            return { ok: true };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Token exchange failed';
            this.logger.error(`Anthropic OAuth exchange failed: ${message}`);
            throw new common_1.HttpException(message, err instanceof anthropic_oauth_service_1.AnthropicOauthExchangeError ? err.status : common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async pending(agentName, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        return ((await this.oauthService.findPendingForAgent(agent.id, agent.tenant_id)) ?? { state: null });
    }
    async revoke(agentName, label, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const keyLabel = (0, query_params_1.optionalTrimmedStringQuery)(label, 'label');
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        const { notifications } = await this.providerService.removeProvider(agent.id, agent.tenant_id, 'anthropic', 'subscription', keyLabel);
        return { ok: true, notifications };
    }
};
exports.AnthropicOauthController = AnthropicOauthController;
__decorate([
    (0, common_1.Post)('authorize'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnthropicOauthController.prototype, "authorize", null);
__decorate([
    (0, common_1.Post)('exchange'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, common_1.Body)('code')),
    __param(2, (0, common_1.Body)('state')),
    __param(3, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnthropicOauthController.prototype, "exchange", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnthropicOauthController.prototype, "pending", null);
__decorate([
    (0, common_1.Post)('revoke'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, common_1.Query)('label')),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnthropicOauthController.prototype, "revoke", null);
exports.AnthropicOauthController = AnthropicOauthController = AnthropicOauthController_1 = __decorate([
    (0, common_1.Controller)('api/v1/oauth/anthropic'),
    __metadata("design:paramtypes", [anthropic_oauth_service_1.AnthropicOauthService,
        resolve_agent_service_1.ResolveAgentService,
        provider_service_1.ProviderService])
], AnthropicOauthController);
//# sourceMappingURL=anthropic-oauth.controller.js.map