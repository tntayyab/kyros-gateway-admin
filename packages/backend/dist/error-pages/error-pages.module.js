"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorPagesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const public_error_page_entity_1 = require("../entities/public-error-page.entity");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const error_pages_service_1 = require("./error-pages.service");
const error_discovery_service_1 = require("./error-discovery.service");
const error_cluster_seeder_service_1 = require("./error-cluster-seeder.service");
const error_page_seeder_service_1 = require("./error-page-seeder.service");
const public_error_pages_controller_1 = require("./public-error-pages.controller");
const internal_error_pages_controller_1 = require("./internal-error-pages.controller");
let ErrorPagesModule = class ErrorPagesModule {
};
exports.ErrorPagesModule = ErrorPagesModule;
exports.ErrorPagesModule = ErrorPagesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([public_error_page_entity_1.PublicErrorPage, agent_message_entity_1.AgentMessage])],
        controllers: [public_error_pages_controller_1.PublicErrorPagesController, internal_error_pages_controller_1.InternalErrorPagesController],
        providers: [
            error_pages_service_1.ErrorPagesService,
            error_discovery_service_1.ErrorDiscoveryService,
            error_cluster_seeder_service_1.ErrorClusterSeederService,
            error_page_seeder_service_1.ErrorPageSeederService,
        ],
    })
], ErrorPagesModule);
//# sourceMappingURL=error-pages.module.js.map