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
var OpenaiOauthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenaiOauthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const tenant_context_decorator_1 = require("../../../common/decorators/tenant-context.decorator");
const openai_oauth_service_1 = require("./openai-oauth.service");
const resolve_agent_service_1 = require("../../routing-core/resolve-agent.service");
const provider_service_1 = require("../../routing-core/provider.service");
const provider_key_service_1 = require("../../routing-core/provider-key.service");
const query_params_1 = require("../core/query-params");
let OpenaiOauthController = OpenaiOauthController_1 = class OpenaiOauthController {
    oauthService;
    resolveAgent;
    providerKeyService;
    providerService;
    configService;
    logger = new common_1.Logger(OpenaiOauthController_1.name);
    constructor(oauthService, resolveAgent, providerKeyService, providerService, configService) {
        this.oauthService = oauthService;
        this.resolveAgent = resolveAgent;
        this.providerKeyService = providerKeyService;
        this.providerService = providerService;
        this.configService = configService;
    }
    async authorize(agentName, ctx, req) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        const trustedBackendUrl = this.configService.get('BETTER_AUTH_URL');
        const backendUrl = trustedBackendUrl || `${req.protocol}://${req.get('host')}`;
        try {
            const url = await this.oauthService.generateAuthorizationUrl(agent.id, agent.tenant_id, backendUrl, ctx.userId);
            return { url };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start OAuth callback server';
            throw new common_1.HttpException(message, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async revoke(agentName, label, ctx) {
        if (!agentName) {
            throw new common_1.HttpException('agentName query parameter is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const keyLabel = (0, query_params_1.optionalTrimmedStringQuery)(label, 'label');
        const agent = await this.resolveAgent.resolve(ctx.tenantId, agentName);
        const keys = await this.providerKeyService.getProviderKeys(agent.tenant_id, 'openai', 'subscription');
        const keysToRevoke = keyLabel
            ? keys.filter((key) => key.label.toLowerCase() === keyLabel.toLowerCase())
            : keys;
        for (const key of keysToRevoke) {
            if (!key.apiKey)
                continue;
            try {
                const blob = JSON.parse(key.apiKey);
                if (blob.t)
                    await this.oauthService.revokeToken(blob.t);
                if (blob.r)
                    await this.oauthService.revokeToken(blob.r);
            }
            catch {
                this.logger.warn('Could not parse OAuth token blob for revocation');
            }
        }
        const { notifications } = await this.providerService.removeProvider(agent.id, agent.tenant_id, 'openai', 'subscription', keyLabel);
        return { ok: true, notifications };
    }
    async callback(code, state, _ctx) {
        if (!code || !state) {
            throw new common_1.HttpException('code and state are required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            await this.oauthService.exchangeCode(state, code);
            return { ok: true };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Token exchange failed';
            this.logger.error(`OAuth callback exchange failed: ${message}`);
            throw new common_1.HttpException(message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    done(ok, res) {
        const success = ok === '1';
        const nonce = (0, crypto_1.randomBytes)(16).toString('base64');
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'`);
        res.send((0, openai_oauth_service_1.oauthDoneHtml)(success, nonce));
    }
};
exports.OpenaiOauthController = OpenaiOauthController;
__decorate([
    (0, common_1.Get)('authorize'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OpenaiOauthController.prototype, "authorize", null);
__decorate([
    (0, common_1.Post)('revoke'),
    __param(0, (0, common_1.Query)('agentName')),
    __param(1, (0, common_1.Query)('label')),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OpenaiOauthController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('state')),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OpenaiOauthController.prototype, "callback", null);
__decorate([
    (0, common_1.Get)('done'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('ok')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OpenaiOauthController.prototype, "done", null);
exports.OpenaiOauthController = OpenaiOauthController = OpenaiOauthController_1 = __decorate([
    (0, common_1.Controller)('api/v1/oauth/openai'),
    __metadata("design:paramtypes", [openai_oauth_service_1.OpenaiOauthService,
        resolve_agent_service_1.ResolveAgentService,
        provider_key_service_1.ProviderKeyService,
        provider_service_1.ProviderService,
        config_1.ConfigService])
], OpenaiOauthController);
//# sourceMappingURL=openai-oauth.controller.js.map