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
exports.AgentApiKey = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const agent_entity_1 = require("./agent.entity");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let AgentApiKey = class AgentApiKey {
    id;
    key;
    key_hash;
    key_prefix;
    label;
    tenant;
    tenant_id;
    agent;
    agent_id;
    is_active;
    expires_at;
    last_used_at;
    created_at;
};
exports.AgentApiKey = AgentApiKey;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], AgentApiKey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", Object)
], AgentApiKey.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)('varchar', { length: 128 }),
    __metadata("design:type", String)
], AgentApiKey.prototype, "key_hash", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 12 }),
    __metadata("design:type", String)
], AgentApiKey.prototype, "key_prefix", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentApiKey.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], AgentApiKey.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], AgentApiKey.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => agent_entity_1.Agent, (a) => a.apiKey, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'agent_id' }),
    __metadata("design:type", agent_entity_1.Agent)
], AgentApiKey.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], AgentApiKey.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], AgentApiKey.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { nullable: true }),
    __metadata("design:type", Object)
], AgentApiKey.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { nullable: true }),
    __metadata("design:type", Object)
], AgentApiKey.prototype, "last_used_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], AgentApiKey.prototype, "created_at", void 0);
exports.AgentApiKey = AgentApiKey = __decorate([
    (0, typeorm_1.Entity)('agent_api_keys')
], AgentApiKey);
//# sourceMappingURL=agent-api-key.entity.js.map