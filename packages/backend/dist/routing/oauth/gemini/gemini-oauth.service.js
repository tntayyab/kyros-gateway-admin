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
var GeminiOauthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiOauthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const provider_service_1 = require("../../routing-core/provider.service");
const model_discovery_service_1 = require("../../../model-discovery/model-discovery.service");
const redirect_pkce_oauth_base_1 = require("../core/redirect-pkce-oauth.base");
const codeassist_client_service_1 = require("./codeassist-client.service");
const DEFAULT_CLIENT_ID = [
    '681255809395-oo8ft2oprdrnp9e',
    '3aqf6av3hmdib135j',
    '.apps.googleusercontent.com',
].join('');
const DEFAULT_CLIENT_SECRET = ['GOCSPX-', '4uHgMPm-1o7Sk-geV6Cu5clXFsxl'].join('');
let GeminiOauthService = GeminiOauthService_1 = class GeminiOauthService extends redirect_pkce_oauth_base_1.RedirectPkceOauthBaseService {
    codeAssist;
    constructor(providerService, configService, discoveryService, codeAssist) {
        super(providerService, configService, discoveryService, {
            providerId: 'gemini',
            serviceName: GeminiOauthService_1.name,
            defaultClientId: DEFAULT_CLIENT_ID,
            defaultClientSecret: DEFAULT_CLIENT_SECRET,
            clientIdEnvVar: 'GEMINI_OAUTH_CLIENT_ID',
            clientSecretEnvVar: 'GEMINI_OAUTH_CLIENT_SECRET',
            authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            revokeUrl: 'https://oauth2.googleapis.com/revoke',
            scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            extraAuthorizeParams: { access_type: 'offline', prompt: 'consent' },
            callbackPort: 1455,
        });
        this.codeAssist = codeAssist;
    }
    async enrichBlob(blob) {
        const { projectId } = await this.codeAssist.onboard(blob.t);
        return { ...blob, u: projectId };
    }
};
exports.GeminiOauthService = GeminiOauthService;
exports.GeminiOauthService = GeminiOauthService = GeminiOauthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        config_1.ConfigService,
        model_discovery_service_1.ModelDiscoveryService,
        codeassist_client_service_1.CodeAssistClientService])
], GeminiOauthService);
//# sourceMappingURL=gemini-oauth.service.js.map