"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthModule = void 0;
const common_1 = require("@nestjs/common");
const routing_core_module_1 = require("../routing-core/routing-core.module");
const model_discovery_module_1 = require("../../model-discovery/model-discovery.module");
const openai_oauth_service_1 = require("./openai/openai-oauth.service");
const openai_oauth_controller_1 = require("./openai/openai-oauth.controller");
const minimax_oauth_service_1 = require("./minimax/minimax-oauth.service");
const minimax_oauth_controller_1 = require("./minimax/minimax-oauth.controller");
const copilot_device_auth_service_1 = require("./copilot/copilot-device-auth.service");
const anthropic_oauth_service_1 = require("./anthropic/anthropic-oauth.service");
const anthropic_oauth_controller_1 = require("./anthropic/anthropic-oauth.controller");
const kiro_oauth_service_1 = require("./kiro/kiro-oauth.service");
const kiro_oauth_controller_1 = require("./kiro/kiro-oauth.controller");
const xai_oauth_controller_1 = require("./xai/xai-oauth.controller");
const xai_oauth_service_1 = require("./xai/xai-oauth.service");
const core_1 = require("./core");
const gemini_oauth_service_1 = require("./gemini/gemini-oauth.service");
const gemini_oauth_controller_1 = require("./gemini/gemini-oauth.controller");
const codeassist_client_service_1 = require("./gemini/codeassist-client.service");
let OAuthModule = class OAuthModule {
};
exports.OAuthModule = OAuthModule;
exports.OAuthModule = OAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [routing_core_module_1.RoutingCoreModule, model_discovery_module_1.ModelDiscoveryModule],
        controllers: [
            openai_oauth_controller_1.OpenaiOauthController,
            minimax_oauth_controller_1.MinimaxOauthController,
            anthropic_oauth_controller_1.AnthropicOauthController,
            gemini_oauth_controller_1.GeminiOauthController,
            kiro_oauth_controller_1.KiroOauthController,
            xai_oauth_controller_1.XaiOauthController,
        ],
        providers: [
            openai_oauth_service_1.OpenaiOauthService,
            minimax_oauth_service_1.MinimaxOauthService,
            copilot_device_auth_service_1.CopilotDeviceAuthService,
            anthropic_oauth_service_1.AnthropicOauthService,
            kiro_oauth_service_1.KiroOauthService,
            xai_oauth_service_1.XaiOauthService,
            core_1.OAuthPendingFlowStore,
            gemini_oauth_service_1.GeminiOauthService,
            codeassist_client_service_1.CodeAssistClientService,
        ],
        exports: [
            openai_oauth_service_1.OpenaiOauthService,
            minimax_oauth_service_1.MinimaxOauthService,
            copilot_device_auth_service_1.CopilotDeviceAuthService,
            anthropic_oauth_service_1.AnthropicOauthService,
            gemini_oauth_service_1.GeminiOauthService,
            kiro_oauth_service_1.KiroOauthService,
            xai_oauth_service_1.XaiOauthService,
        ],
    })
], OAuthModule);
//# sourceMappingURL=oauth.module.js.map