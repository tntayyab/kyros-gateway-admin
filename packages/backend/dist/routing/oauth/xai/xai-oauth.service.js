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
var XaiOauthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XaiOauthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const provider_service_1 = require("../../routing-core/provider.service");
const model_discovery_service_1 = require("../../../model-discovery/model-discovery.service");
const redirect_pkce_oauth_base_1 = require("../core/redirect-pkce-oauth.base");
const DEFAULT_CLIENT_ID = 'b1a00492-073a-47ea-816f-4c329264a828';
const CALLBACK_PORT = 56121;
let XaiOauthService = XaiOauthService_1 = class XaiOauthService extends redirect_pkce_oauth_base_1.RedirectPkceOauthBaseService {
    constructor(providerService, configService, discoveryService) {
        super(providerService, configService, discoveryService, {
            providerId: 'xai',
            serviceName: XaiOauthService_1.name,
            defaultClientId: DEFAULT_CLIENT_ID,
            clientIdEnvVar: 'XAI_OAUTH_CLIENT_ID',
            authorizeUrl: 'https://auth.x.ai/oauth2/authorize',
            tokenUrl: 'https://auth.x.ai/oauth2/token',
            revokeUrl: 'https://auth.x.ai/oauth2/revoke',
            scope: 'openid profile email offline_access grok-cli:access api:access',
            callbackPort: CALLBACK_PORT,
            redirectUri: `http://127.0.0.1:${CALLBACK_PORT}/callback`,
            callbackPath: '/callback',
            includeNonce: true,
            extraTokenHeaders: { Accept: 'application/json' },
            providerLabel: 'xAI Login',
        });
    }
};
exports.XaiOauthService = XaiOauthService;
exports.XaiOauthService = XaiOauthService = XaiOauthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        config_1.ConfigService,
        model_discovery_service_1.ModelDiscoveryService])
], XaiOauthService);
//# sourceMappingURL=xai-oauth.service.js.map