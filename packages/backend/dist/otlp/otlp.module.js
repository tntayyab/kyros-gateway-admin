"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtlpModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_api_key_entity_1 = require("../entities/agent-api-key.entity");
const agent_entity_1 = require("../entities/agent.entity");
const tenant_entity_1 = require("../entities/tenant.entity");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const api_key_service_1 = require("./services/api-key.service");
const agent_key_auth_guard_1 = require("./guards/agent-key-auth.guard");
const otlp_deprecated_controller_1 = require("./otlp-deprecated.controller");
let OtlpModule = class OtlpModule {
};
exports.OtlpModule = OtlpModule;
exports.OtlpModule = OtlpModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_api_key_entity_1.AgentApiKey, agent_entity_1.Agent, tenant_entity_1.Tenant, tenant_provider_entity_1.TenantProvider])],
        controllers: [otlp_deprecated_controller_1.OtlpDeprecatedController],
        providers: [api_key_service_1.ApiKeyGeneratorService, agent_key_auth_guard_1.AgentKeyAuthGuard],
        exports: [api_key_service_1.ApiKeyGeneratorService, agent_key_auth_guard_1.AgentKeyAuthGuard, typeorm_1.TypeOrmModule],
    })
], OtlpModule);
//# sourceMappingURL=otlp.module.js.map