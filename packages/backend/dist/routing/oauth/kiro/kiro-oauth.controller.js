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
exports.KiroOauthController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../../../common/decorators/tenant-context.decorator");
const kiro_oauth_service_1 = require("./kiro-oauth.service");
const kiro_oidc_1 = require("./kiro-oidc");
const resolve_agent_service_1 = require("../../routing-core/resolve-agent.service");
const provider_service_1 = require("../../routing-core/provider.service");
const query_params_1 = require("../core/query-params");
let KiroOauthController = class KiroOauthController {
    oauthService;
    resolveAgent;
    providerService;
    constructor(oauthService, resolveAgent, providerService) {
        this.oauthService = oauthService;
        this.resolveAgent = resolveAgent;
        this.providerService = providerService;
    }
    async start(agentName, ctx, startUrl, region) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const options = {};
        const trimmedStartUrl = (0, query_params_1.optionalTrimmedStringQuery)(startUrl, 'startUrl');
        const trimmedRegion = (0, query_params_1.optionalTrimmedStringQuery)(region, 'region');
        if (trimmedStartUrl !== undefined) {
            options.startUrl = trimmedStartUrl;
        }
        if (trimmedRegion !== undefined) {
            options.region = trimmedRegion;
        }
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        try {
            return await this.oauthService.startAuthorization(agent.id, agent.tenant_id, ctx.userId, options);
        }
        catch (err) {
            if (err instanceof kiro_oidc_1.KiroAuthorizationOptionsError) {
                throw new common_1.HttpException(err.message, common_1.HttpStatus.BAD_REQUEST);
            }
            const message = err instanceof Error ? err.message : 'Failed to start Kiro login';
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
            const message = err instanceof Error ? err.message : 'Failed to poll Kiro login';
            throw new common_1.HttpException(message, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async revoke(agentName, label, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const keyLabel = (0, query_params_1.optionalTrimmedStringQuery)(label, 'label');
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        const { notifications } = await this.providerService.removeProvider(agent.id, agent.tenant_id, 'kiro', 'subscription', keyLabel);
        return { ok: true, notifications };
    }
};
exports.KiroOauthController = KiroOauthController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(2, (0, common_1.Query)('startUrl')),
    __param(3, (0, common_1.Query)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], KiroOauthController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('poll'),
    __param(0, (0, common_1.Query)('flowId')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KiroOauthController.prototype, "poll", null);
__decorate([
    (0, common_1.Post)('revoke'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, common_1.Query)('label')),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], KiroOauthController.prototype, "revoke", null);
exports.KiroOauthController = KiroOauthController = __decorate([
    (0, common_1.Controller)('api/v1/oauth/kiro'),
    __metadata("design:paramtypes", [kiro_oauth_service_1.KiroOauthService,
        resolve_agent_service_1.ResolveAgentService,
        provider_service_1.ProviderService])
], KiroOauthController);
//# sourceMappingURL=kiro-oauth.controller.js.map