"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const request_entity_1 = require("../entities/request.entity");
const agent_entity_1 = require("../entities/agent.entity");
const playground_run_entity_1 = require("../entities/playground-run.entity");
const playground_column_entity_1 = require("../entities/playground-column.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const common_module_1 = require("../common/common.module");
const model_prices_module_1 = require("../model-prices/model-prices.module");
const routing_core_module_1 = require("../routing/routing-core/routing-core.module");
const proxy_module_1 = require("../routing/proxy/proxy.module");
const oauth_module_1 = require("../routing/oauth/oauth.module");
const model_discovery_module_1 = require("../model-discovery/model-discovery.module");
const custom_provider_module_1 = require("../routing/custom-provider/custom-provider.module");
const playground_controller_1 = require("./playground.controller");
const playground_service_1 = require("./playground.service");
const playground_history_service_1 = require("./playground-history.service");
const playground_agent_service_1 = require("./playground-agent.service");
let PlaygroundModule = class PlaygroundModule {
};
exports.PlaygroundModule = PlaygroundModule;
exports.PlaygroundModule = PlaygroundModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                agent_message_entity_1.AgentMessage,
                request_entity_1.ManifestRequest,
                agent_entity_1.Agent,
                playground_run_entity_1.PlaygroundRun,
                playground_column_entity_1.PlaygroundColumn,
                custom_provider_entity_1.CustomProvider,
            ]),
            common_module_1.CommonModule,
            model_prices_module_1.ModelPricesModule,
            routing_core_module_1.RoutingCoreModule,
            proxy_module_1.ProxyModule,
            oauth_module_1.OAuthModule,
            model_discovery_module_1.ModelDiscoveryModule,
            custom_provider_module_1.CustomProviderModule,
        ],
        controllers: [playground_controller_1.PlaygroundController],
        providers: [playground_service_1.PlaygroundService, playground_history_service_1.PlaygroundHistoryService, playground_agent_service_1.PlaygroundAgentService],
    })
], PlaygroundModule);
//# sourceMappingURL=playground.module.js.map