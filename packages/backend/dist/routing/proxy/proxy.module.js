"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const custom_provider_entity_1 = require("../../entities/custom-provider.entity");
const reasoning_content_cache_entry_entity_1 = require("../../entities/reasoning-content-cache-entry.entity");
const routing_core_module_1 = require("../routing-core/routing-core.module");
const model_prices_module_1 = require("../../model-prices/model-prices.module");
const model_discovery_module_1 = require("../../model-discovery/model-discovery.module");
const notifications_module_1 = require("../../notifications/notifications.module");
const otlp_module_1 = require("../../otlp/otlp.module");
const oauth_module_1 = require("../oauth/oauth.module");
const resolve_module_1 = require("../resolve/resolve.module");
const custom_provider_module_1 = require("../custom-provider/custom-provider.module");
const header_tiers_module_1 = require("../header-tiers/header-tiers.module");
const billing_module_1 = require("../../billing/billing.module");
const autofix_module_1 = require("../autofix/autofix.module");
const proxy_controller_1 = require("./proxy.controller");
const proxy_service_1 = require("./proxy.service");
const proxy_fallback_service_1 = require("./proxy-fallback.service");
const provider_client_1 = require("./provider-client");
const proxy_rate_limiter_1 = require("./proxy-rate-limiter");
const proxy_message_recorder_1 = require("./proxy-message-recorder");
const session_momentum_service_1 = require("./session-momentum.service");
const copilot_token_service_1 = require("./copilot-token.service");
const thought_signature_cache_1 = require("./thought-signature-cache");
const thinking_block_cache_1 = require("./thinking-block-cache");
const reasoning_content_cache_1 = require("./reasoning-content-cache");
const reasoning_model_catalog_1 = require("./reasoning-model-catalog");
const codex_session_affinity_1 = require("./codex-session-affinity");
const proxy_exception_filter_1 = require("./proxy-exception.filter");
const attempt_recording_service_1 = require("./attempt-recording.service");
let ProxyModule = class ProxyModule {
};
exports.ProxyModule = ProxyModule;
exports.ProxyModule = ProxyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agent_message_entity_1.AgentMessage, custom_provider_entity_1.CustomProvider, reasoning_content_cache_entry_entity_1.ReasoningContentCacheEntry]),
            routing_core_module_1.RoutingCoreModule,
            model_prices_module_1.ModelPricesModule,
            model_discovery_module_1.ModelDiscoveryModule,
            notifications_module_1.NotificationsModule,
            otlp_module_1.OtlpModule,
            oauth_module_1.OAuthModule,
            resolve_module_1.ResolveModule,
            custom_provider_module_1.CustomProviderModule,
            header_tiers_module_1.HeaderTiersModule,
            billing_module_1.BillingModule,
            autofix_module_1.AutofixModule,
        ],
        controllers: [proxy_controller_1.ProxyController],
        providers: [
            proxy_service_1.ProxyService,
            proxy_fallback_service_1.ProxyFallbackService,
            provider_client_1.ProviderClient,
            proxy_rate_limiter_1.ProxyRateLimiter,
            proxy_message_recorder_1.ProxyMessageRecorder,
            session_momentum_service_1.SessionMomentumService,
            copilot_token_service_1.CopilotTokenService,
            thought_signature_cache_1.ThoughtSignatureCache,
            thinking_block_cache_1.ThinkingBlockCache,
            reasoning_content_cache_1.ReasoningContentCache,
            reasoning_model_catalog_1.ModelsDevReasoningCatalog,
            codex_session_affinity_1.CodexSessionAffinity,
            proxy_exception_filter_1.ProxyExceptionFilter,
            attempt_recording_service_1.AttemptRecordingService,
        ],
        exports: [provider_client_1.ProviderClient],
    })
], ProxyModule);
//# sourceMappingURL=proxy.module.js.map