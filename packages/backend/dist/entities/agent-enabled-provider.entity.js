"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentEnabledProvider = void 0;
const typeorm_1 = require("typeorm");
const agent_entity_1 = require("./agent.entity");
const tenant_provider_entity_1 = require("./tenant-provider.entity");
let AgentEnabledProvider = class AgentEnabledProvider {
    agent_id;
    agent;
    tenant_provider_id;
    tenantProvider;
};
exports.AgentEnabledProvider = AgentEnabledProvider;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], AgentEnabledProvider.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => agent_entity_1.Agent, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'agent_id' }),
    __metadata("design:type", agent_entity_1.Agent)
], AgentEnabledProvider.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], AgentEnabledProvider.prototype, "tenant_provider_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_provider_entity_1.TenantProvider, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_provider_id' }),
    __metadata("design:type", tenant_provider_entity_1.TenantProvider)
], AgentEnabledProvider.prototype, "tenantProvider", void 0);
exports.AgentEnabledProvider = AgentEnabledProvider = __decorate([
    (0, typeorm_1.Entity)('agent_enabled_providers')
], AgentEnabledProvider);
//# sourceMappingURL=agent-enabled-provider.entity.js.map