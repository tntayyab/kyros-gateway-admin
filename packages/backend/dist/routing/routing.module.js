"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingModule = void 0;
const common_1 = require("@nestjs/common");
const route_model_params_module_1 = require("./model-params/route-model-params.module");
const typeorm_1 = require("@nestjs/typeorm");
const model_prices_module_1 = require("../model-prices/model-prices.module");
const model_discovery_module_1 = require("../model-discovery/model-discovery.module");
const otlp_module_1 = require("../otlp/otlp.module");
const routing_core_module_1 = require("./routing-core/routing-core.module");
const proxy_module_1 = require("./proxy/proxy.module");
const oauth_module_1 = require("./oauth/oauth.module");
const custom_provider_module_1 = require("./custom-provider/custom-provider.module");
const resolve_module_1 = require("./resolve/resolve.module");
const header_tiers_module_1 = require("./header-tiers/header-tiers.module");
const autofix_module_1 = require("./autofix/autofix.module");
const provider_controller_1 = require("./provider.controller");
const tier_controller_1 = require("./tier.controller");
const model_controller_1 = require("./model.controller");
const copilot_controller_1 = require("./oauth/copilot/copilot.controller");
const specificity_controller_1 = require("./specificity.controller");
const model_params_controller_1 = require("./model-params.controller");
const tenant_providers_controller_1 = require("./tenant-providers.controller");
const agent_enabled_providers_controller_1 = require("./agent-enabled-providers.controller");
const managed_free_provider_controller_1 = require("./managed-free-provider/managed-free-provider.controller");
const managed_free_provider_service_1 = require("./managed-free-provider/managed-free-provider.service");
const ollama_sync_service_1 = require("../database/ollama-sync.service");
const notifications_module_1 = require("../notifications/notifications.module");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const agent_entity_1 = require("../entities/agent.entity");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const tenant_entity_1 = require("../entities/tenant.entity");
const tier_assignment_entity_1 = require("../entities/tier-assignment.entity");
const specificity_assignment_entity_1 = require("../entities/specificity-assignment.entity");
const header_tier_entity_1 = require("../entities/header-tier.entity");
const install_metadata_entity_1 = require("../entities/install-metadata.entity");
let RoutingModule = class RoutingModule {
};
exports.RoutingModule = RoutingModule;
exports.RoutingModule = RoutingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                tenant_provider_entity_1.TenantProvider,
                agent_enabled_provider_entity_1.AgentEnabledProvider,
                agent_entity_1.Agent,
                agent_message_entity_1.AgentMessage,
                tenant_entity_1.Tenant,
                tier_assignment_entity_1.TierAssignment,
                specificity_assignment_entity_1.SpecificityAssignment,
                header_tier_entity_1.HeaderTier,
                install_metadata_entity_1.InstallMetadata,
            ]),
            routing_core_module_1.RoutingCoreModule,
            model_prices_module_1.ModelPricesModule,
            model_discovery_module_1.ModelDiscoveryModule,
            notifications_module_1.NotificationsModule,
            otlp_module_1.OtlpModule,
            proxy_module_1.ProxyModule,
            oauth_module_1.OAuthModule,
            custom_provider_module_1.CustomProviderModule,
            resolve_module_1.ResolveModule,
            header_tiers_module_1.HeaderTiersModule,
            autofix_module_1.AutofixModule,
            route_model_params_module_1.RouteModelParamsModule,
        ],
        controllers: [
            provider_controller_1.ProviderController,
            tier_controller_1.TierController,
            model_controller_1.ModelController,
            copilot_controller_1.CopilotController,
            specificity_controller_1.SpecificityController,
            model_params_controller_1.ModelParamsController,
            tenant_providers_controller_1.TenantProvidersController,
            agent_enabled_providers_controller_1.AgentEnabledProvidersController,
            managed_free_provider_controller_1.ManagedFreeProviderController,
        ],
        providers: [ollama_sync_service_1.OllamaSyncService, managed_free_provider_service_1.ManagedFreeProviderService],
        exports: [routing_core_module_1.RoutingCoreModule, custom_provider_module_1.CustomProviderModule, oauth_module_1.OAuthModule],
    })
], RoutingModule);
//# sourceMappingURL=routing.module.js.map