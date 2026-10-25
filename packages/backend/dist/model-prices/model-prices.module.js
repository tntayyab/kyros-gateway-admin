"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPricesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const model_prices_controller_1 = require("./model-prices.controller");
const model_prices_service_1 = require("./model-prices.service");
const model_pricing_cache_service_1 = require("./model-pricing-cache.service");
const pricing_sync_service_1 = require("../database/pricing-sync.service");
const models_dev_sync_service_1 = require("../database/models-dev-sync.service");
const provider_model_registry_service_1 = require("../model-discovery/provider-model-registry.service");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
let ModelPricesModule = class ModelPricesModule {
};
exports.ModelPricesModule = ModelPricesModule;
exports.ModelPricesModule = ModelPricesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_provider_entity_1.TenantProvider, custom_provider_entity_1.CustomProvider])],
        controllers: [model_prices_controller_1.ModelPricesController],
        providers: [
            model_prices_service_1.ModelPricesService,
            model_pricing_cache_service_1.ModelPricingCacheService,
            pricing_sync_service_1.PricingSyncService,
            models_dev_sync_service_1.ModelsDevSyncService,
            provider_model_registry_service_1.ProviderModelRegistryService,
        ],
        exports: [
            model_prices_service_1.ModelPricesService,
            model_pricing_cache_service_1.ModelPricingCacheService,
            pricing_sync_service_1.PricingSyncService,
            models_dev_sync_service_1.ModelsDevSyncService,
            provider_model_registry_service_1.ProviderModelRegistryService,
        ],
    })
], ModelPricesModule);
//# sourceMappingURL=model-prices.module.js.map