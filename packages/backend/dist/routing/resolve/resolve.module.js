"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveModule = void 0;
const common_1 = require("@nestjs/common");
const otlp_module_1 = require("../../otlp/otlp.module");
const routing_core_module_1 = require("../routing-core/routing-core.module");
const model_prices_module_1 = require("../../model-prices/model-prices.module");
const model_discovery_module_1 = require("../../model-discovery/model-discovery.module");
const header_tiers_module_1 = require("../header-tiers/header-tiers.module");
const resolve_controller_1 = require("./resolve.controller");
const resolve_service_1 = require("./resolve.service");
let ResolveModule = class ResolveModule {
};
exports.ResolveModule = ResolveModule;
exports.ResolveModule = ResolveModule = __decorate([
    (0, common_1.Module)({
        imports: [
            otlp_module_1.OtlpModule,
            routing_core_module_1.RoutingCoreModule,
            model_prices_module_1.ModelPricesModule,
            model_discovery_module_1.ModelDiscoveryModule,
            (0, common_1.forwardRef)(() => header_tiers_module_1.HeaderTiersModule),
        ],
        controllers: [resolve_controller_1.ResolveController],
        providers: [resolve_service_1.ResolveService],
        exports: [resolve_service_1.ResolveService],
    })
], ResolveModule);
//# sourceMappingURL=resolve.module.js.map