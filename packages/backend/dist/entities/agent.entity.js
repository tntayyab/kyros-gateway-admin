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
exports.Agent = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const agent_api_key_entity_1 = require("./agent-api-key.entity");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let Agent = class Agent {
    id;
    name;
    display_name;
    description;
    agent_category;
    agent_platform;
    is_active;
    complexity_routing_enabled;
    autofix_enabled;
    record_messages;
    is_playground;
    tenant;
    tenant_id;
    apiKey;
    created_at;
    updated_at;
    deleted_at;
};
exports.Agent = Agent;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], Agent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Agent.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], Agent.prototype, "display_name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], Agent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], Agent.prototype, "agent_category", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], Agent.prototype, "agent_platform", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], Agent.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], Agent.prototype, "complexity_routing_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { nullable: true }),
    __metadata("design:type", Object)
], Agent.prototype, "autofix_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], Agent.prototype, "record_messages", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], Agent.prototype, "is_playground", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (t) => t.agents, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Agent.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Agent.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => agent_api_key_entity_1.AgentApiKey, (k) => k.agent, { cascade: true }),
    __metadata("design:type", agent_api_key_entity_1.AgentApiKey)
], Agent.prototype, "apiKey", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], Agent.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], Agent.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { nullable: true, default: null }),
    __metadata("design:type", Object)
], Agent.prototype, "deleted_at", void 0);
exports.Agent = Agent = __decorate([
    (0, typeorm_1.Entity)('agents'),
    (0, typeorm_1.Index)(['tenant_id', 'name'], { unique: true, where: '"deleted_at" IS NULL' })
], Agent);
//# sourceMappingURL=agent.entity.js.map