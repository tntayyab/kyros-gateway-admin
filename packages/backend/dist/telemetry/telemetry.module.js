"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_entity_1 = require("../entities/agent.entity");
const api_key_entity_1 = require("../entities/api-key.entity");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const install_metadata_entity_1 = require("../entities/install-metadata.entity");
const request_entity_1 = require("../entities/request.entity");
const install_id_service_1 = require("./install-id.service");
const payload_builder_service_1 = require("./payload-builder.service");
const telemetry_service_1 = require("./telemetry.service");
let TelemetryModule = class TelemetryModule {
};
exports.TelemetryModule = TelemetryModule;
exports.TelemetryModule = TelemetryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([install_metadata_entity_1.InstallMetadata, agent_message_entity_1.AgentMessage, agent_entity_1.Agent, request_entity_1.ManifestRequest, api_key_entity_1.ApiKey]),
        ],
        providers: [install_id_service_1.InstallIdService, payload_builder_service_1.PayloadBuilderService, telemetry_service_1.TelemetryService],
        exports: [install_id_service_1.InstallIdService],
    })
], TelemetryModule);
//# sourceMappingURL=telemetry.module.js.map