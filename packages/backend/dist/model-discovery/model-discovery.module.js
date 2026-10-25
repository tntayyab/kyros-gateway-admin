"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDiscoveryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const model_prices_module_1 = require("../model-prices/model-prices.module");
const provider_model_fetcher_service_1 = require("./provider-model-fetcher.service");
const model_discovery_service_1 = require("./model-discovery.service");
const opencode_go_catalog_service_1 = require("./opencode-go-catalog.service");
const copilot_token_service_1 = require("../routing/proxy/copilot-token.service");
let ModelDiscoveryModule = class ModelDiscoveryModule {
};
exports.ModelDiscoveryModule = ModelDiscoveryModule;
exports.ModelDiscoveryModule = ModelDiscoveryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_provider_entity_1.TenantProvider, agent_enabled_provider_entity_1.AgentEnabledProvider, custom_provider_entity_1.CustomProvider]),
            model_prices_module_1.ModelPricesModule,
        ],
        providers: [
            provider_model_fetcher_service_1.ProviderModelFetcherService,
            model_discovery_service_1.ModelDiscoveryService,
            opencode_go_catalog_service_1.OpencodeGoCatalogService,
            copilot_token_service_1.CopilotTokenService,
        ],
        exports: [model_discovery_service_1.ModelDiscoveryService, provider_model_fetcher_service_1.ProviderModelFetcherService, opencode_go_catalog_service_1.OpencodeGoCatalogService],
    })
], ModelDiscoveryModule);
//# sourceMappingURL=model-discovery.module.js.map