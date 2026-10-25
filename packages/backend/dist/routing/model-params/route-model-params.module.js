"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteModelParamsModule = void 0;
const common_1 = require("@nestjs/common");
const routing_core_module_1 = require("../routing-core/routing-core.module");
const header_tiers_module_1 = require("../header-tiers/header-tiers.module");
const route_model_params_service_1 = require("./route-model-params.service");
const route_model_params_controller_1 = require("./route-model-params.controller");
let RouteModelParamsModule = class RouteModelParamsModule {
};
exports.RouteModelParamsModule = RouteModelParamsModule;
exports.RouteModelParamsModule = RouteModelParamsModule = __decorate([
    (0, common_1.Module)({
        imports: [routing_core_module_1.RoutingCoreModule, header_tiers_module_1.HeaderTiersModule],
        providers: [route_model_params_service_1.RouteModelParamsService],
        controllers: [route_model_params_controller_1.RouteModelParamsController],
        exports: [route_model_params_service_1.RouteModelParamsService],
    })
], RouteModelParamsModule);
//# sourceMappingURL=route-model-params.module.js.map