"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingCoreModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_provider_entity_1 = require("../../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../../entities/agent-enabled-provider.entity");
const tier_assignment_entity_1 = require("../../entities/tier-assignment.entity");
const specificity_assignment_entity_1 = require("../../entities/specificity-assignment.entity");
const agent_model_params_entity_1 = require("../../entities/agent-model-params.entity");
const agent_entity_1 = require("../../entities/agent.entity");
const tenant_entity_1 = require("../../entities/tenant.entity");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const header_tier_entity_1 = require("../../entities/header-tier.entity");
const model_prices_module_1 = require("../../model-prices/model-prices.module");
const model_discovery_module_1 = require("../../model-discovery/model-discovery.module");
const provider_service_1 = require("./provider.service");
const tier_service_1 = require("./tier.service");
const provider_key_service_1 = require("./provider-key.service");
const routing_cache_service_1 = require("./routing-cache.service");
const routing_invalidation_service_1 = require("./routing-invalidation.service");
const resolve_agent_service_1 = require("./resolve-agent.service");
const specificity_service_1 = require("./specificity.service");
const specificity_penalty_service_1 = require("./specificity-penalty.service");
const agent_model_params_service_1 = require("./agent-model-params.service");
const provider_param_spec_service_1 = require("./provider-param-spec.service");
let RoutingCoreModule = class RoutingCoreModule {
};
exports.RoutingCoreModule = RoutingCoreModule;
exports.RoutingCoreModule = RoutingCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                tenant_provider_entity_1.TenantProvider,
                agent_enabled_provider_entity_1.AgentEnabledProvider,
                tier_assignment_entity_1.TierAssignment,
                specificity_assignment_entity_1.SpecificityAssignment,
                agent_model_params_entity_1.AgentModelParams,
                agent_entity_1.Agent,
                tenant_entity_1.Tenant,
                agent_message_entity_1.AgentMessage,
                header_tier_entity_1.HeaderTier,
            ]),
            model_prices_module_1.ModelPricesModule,
            model_discovery_module_1.ModelDiscoveryModule,
        ],
        providers: [
            provider_service_1.ProviderService,
            tier_service_1.TierService,
            provider_key_service_1.ProviderKeyService,
            routing_cache_service_1.RoutingCacheService,
            routing_invalidation_service_1.RoutingInvalidationService,
            resolve_agent_service_1.ResolveAgentService,
            specificity_service_1.SpecificityService,
            specificity_penalty_service_1.SpecificityPenaltyService,
            agent_model_params_service_1.AgentModelParamsService,
            provider_param_spec_service_1.ProviderParamSpecService,
        ],
        exports: [
            typeorm_1.TypeOrmModule,
            provider_service_1.ProviderService,
            tier_service_1.TierService,
            provider_key_service_1.ProviderKeyService,
            routing_cache_service_1.RoutingCacheService,
            routing_invalidation_service_1.RoutingInvalidationService,
            resolve_agent_service_1.ResolveAgentService,
            specificity_service_1.SpecificityService,
            specificity_penalty_service_1.SpecificityPenaltyService,
            agent_model_params_service_1.AgentModelParamsService,
            provider_param_spec_service_1.ProviderParamSpecService,
        ],
    })
], RoutingCoreModule);
//# sourceMappingURL=routing-core.module.js.map