"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpModule = void 0;
const common_1 = require("@nestjs/common");
const route_model_params_module_1 = require("../routing/model-params/route-model-params.module");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_module_1 = require("../analytics/analytics.module");
const common_module_1 = require("../common/common.module");
const autofix_module_1 = require("../routing/autofix/autofix.module");
const custom_provider_module_1 = require("../routing/custom-provider/custom-provider.module");
const header_tiers_module_1 = require("../routing/header-tiers/header-tiers.module");
const routing_core_module_1 = require("../routing/routing-core/routing-core.module");
const model_discovery_module_1 = require("../model-discovery/model-discovery.module");
const model_prices_module_1 = require("../model-prices/model-prices.module");
const otlp_module_1 = require("../otlp/otlp.module");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const agent_entity_1 = require("../entities/agent.entity");
const mcp_controller_1 = require("./mcp.controller");
let McpModule = class McpModule {
};
exports.McpModule = McpModule;
exports.McpModule = McpModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_provider_entity_1.TenantProvider, agent_enabled_provider_entity_1.AgentEnabledProvider, agent_entity_1.Agent]),
            common_module_1.CommonModule,
            analytics_module_1.AnalyticsModule,
            routing_core_module_1.RoutingCoreModule,
            header_tiers_module_1.HeaderTiersModule,
            custom_provider_module_1.CustomProviderModule,
            autofix_module_1.AutofixModule,
            model_discovery_module_1.ModelDiscoveryModule,
            model_prices_module_1.ModelPricesModule,
            otlp_module_1.OtlpModule,
            route_model_params_module_1.RouteModelParamsModule,
        ],
        controllers: [mcp_controller_1.McpController],
    })
], McpModule);
//# sourceMappingURL=mcp.module.js.map