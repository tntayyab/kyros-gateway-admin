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
var OpenaiOauthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenaiOauthService = exports.oauthDoneHtml = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const provider_service_1 = require("../../routing-core/provider.service");
const model_discovery_service_1 = require("../../../model-discovery/model-discovery.service");
const core_1 = require("../core");
Object.defineProperty(exports, "oauthDoneHtml", { enumerable: true, get: function () { return core_1.oauthDoneHtml; } });
const redirect_pkce_oauth_base_1 = require("../core/redirect-pkce-oauth.base");
const DEFAULT_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
let OpenaiOauthService = OpenaiOauthService_1 = class OpenaiOauthService extends redirect_pkce_oauth_base_1.RedirectPkceOauthBaseService {
    constructor(providerService, configService, discoveryService) {
        super(providerService, configService, discoveryService, {
            providerId: 'openai',
            serviceName: OpenaiOauthService_1.name,
            defaultClientId: DEFAULT_CLIENT_ID,
            clientIdEnvVar: 'OPENAI_OAUTH_CLIENT_ID',
            authorizeUrl: 'https://auth.openai.com/oauth/authorize',
            tokenUrl: 'https://auth.openai.com/oauth/token',
            revokeUrl: 'https://auth.openai.com/oauth/revoke',
            scope: 'openid profile email offline_access',
            callbackPort: 1455,
        });
    }
};
exports.OpenaiOauthService = OpenaiOauthService;
exports.OpenaiOauthService = OpenaiOauthService = OpenaiOauthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        config_1.ConfigService,
        model_discovery_service_1.ModelDiscoveryService])
], OpenaiOauthService);
//# sourceMappingURL=openai-oauth.service.js.map