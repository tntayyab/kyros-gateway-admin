"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomProviderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const custom_provider_entity_1 = require("../../entities/custom-provider.entity");
const routing_core_module_1 = require("../routing-core/routing-core.module");
const model_prices_module_1 = require("../../model-prices/model-prices.module");
const custom_provider_controller_1 = require("./custom-provider.controller");
const custom_provider_service_1 = require("./custom-provider.service");
let CustomProviderModule = class CustomProviderModule {
};
exports.CustomProviderModule = CustomProviderModule;
exports.CustomProviderModule = CustomProviderModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([custom_provider_entity_1.CustomProvider]), routing_core_module_1.RoutingCoreModule, model_prices_module_1.ModelPricesModule],
        controllers: [custom_provider_controller_1.CustomProviderController],
        providers: [custom_provider_service_1.CustomProviderService],
        exports: [custom_provider_service_1.CustomProviderService],
    })
], CustomProviderModule);
//# sourceMappingURL=custom-provider.module.js.map