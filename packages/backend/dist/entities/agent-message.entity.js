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
exports.AgentMessage = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let AgentMessage = class AgentMessage {
    id;
    request_id;
    attempt_number;
    recording_key;
    tenant_id;
    agent_id;
    trace_id;
    session_key;
    session_id;
    timestamp;
    duration_ms;
    input_tokens;
    output_tokens;
    cache_read_tokens;
    cache_creation_tokens;
    cost_usd;
    status;
    agent_usage_rolled_up_at;
    error_message;
    error_http_status;
    error_code;
    error_origin;
    error_class;
    description;
    service_type;
    agent_name;
    model;
    provider;
    routing_tier;
    routing_reason;
    skill_name;
    auth_type;
    fallback_from_model;
    fallback_index;
    superseded;
    user_id;
    specificity_category;
    specificity_miscategorized;
    caller_attribution;
    request_headers;
    request_params;
    header_tier_id;
    header_tier_name;
    header_tier_color;
    feedback_rating;
    feedback_tags;
    feedback_details;
    provider_key_label;
    tenant_provider_id;
    autofix_applied;
    autofix_group_id;
    autofix_role;
    autofix_operations;
    autofix_decision;
};
exports.AgentMessage = AgentMessage;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], AgentMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "request_id", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "attempt_number", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "recording_key", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "trace_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "session_key", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], AgentMessage.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "duration_ms", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], AgentMessage.prototype, "input_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], AgentMessage.prototype, "output_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], AgentMessage.prototype, "cache_read_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], AgentMessage.prototype, "cache_creation_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "cost_usd", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'pending' }),
    __metadata("design:type", String)
], AgentMessage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "agent_usage_rolled_up_at", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "error_http_status", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 8, nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "error_code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "error_origin", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "error_class", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "service_type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "agent_name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "routing_tier", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "routing_reason", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "skill_name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "auth_type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "fallback_from_model", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "fallback_index", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], AgentMessage.prototype, "superseded", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "specificity_category", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], AgentMessage.prototype, "specificity_miscategorized", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "caller_attribution", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "request_headers", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "request_params", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "header_tier_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "header_tier_name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "header_tier_color", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "feedback_rating", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "feedback_tags", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "feedback_details", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "provider_key_label", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "tenant_provider_id", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], AgentMessage.prototype, "autofix_applied", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "autofix_group_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "autofix_role", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "autofix_operations", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { name: 'autofix_phoenix', nullable: true }),
    __metadata("design:type", Object)
], AgentMessage.prototype, "autofix_decision", void 0);
exports.AgentMessage = AgentMessage = __decorate([
    (0, typeorm_1.Entity)('agent_messages'),
    (0, typeorm_1.Index)(['tenant_id', 'agent_id', 'timestamp']),
    (0, typeorm_1.Index)(['tenant_id', 'agent_name', 'timestamp']),
    (0, typeorm_1.Index)(['tenant_id', 'timestamp']),
    (0, typeorm_1.Index)(['tenant_id', 'trace_id']),
    (0, typeorm_1.Index)(['tenant_id', 'model']),
    (0, typeorm_1.Index)(['tenant_id', 'agent_id', 'status']),
    (0, typeorm_1.Index)(['tenant_id', 'agent_id', 'model']),
    (0, typeorm_1.Index)(['tenant_provider_id', 'tenant_id', 'timestamp']),
    (0, typeorm_1.Index)(['tenant_id', 'autofix_group_id'])
], AgentMessage);
//# sourceMappingURL=agent-message.entity.js.map