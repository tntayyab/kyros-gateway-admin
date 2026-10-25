"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderTiersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const header_tier_entity_1 = require("../../entities/header-tier.entity");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const common_module_1 = require("../../common/common.module");
const model_discovery_module_1 = require("../../model-discovery/model-discovery.module");
const routing_core_module_1 = require("../routing-core/routing-core.module");
const header_tier_service_1 = require("./header-tier.service");
const header_tier_controller_1 = require("./header-tier.controller");
const seen_headers_service_1 = require("./seen-headers.service");
const seen_headers_controller_1 = require("./seen-headers.controller");
let HeaderTiersModule = class HeaderTiersModule {
};
exports.HeaderTiersModule = HeaderTiersModule;
exports.HeaderTiersModule = HeaderTiersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([header_tier_entity_1.HeaderTier, agent_message_entity_1.AgentMessage]),
            common_module_1.CommonModule,
            model_discovery_module_1.ModelDiscoveryModule,
            routing_core_module_1.RoutingCoreModule,
        ],
        providers: [header_tier_service_1.HeaderTierService, seen_headers_service_1.SeenHeadersService],
        controllers: [header_tier_controller_1.HeaderTierController, seen_headers_controller_1.SeenHeadersController],
        exports: [header_tier_service_1.HeaderTierService],
    })
], HeaderTiersModule);
//# sourceMappingURL=header-tiers.module.js.map