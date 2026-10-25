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
exports.ManifestRequest = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let ManifestRequest = class ManifestRequest {
    id;
    tenant_id;
    agent_id;
    user_id;
    agent_name;
    trace_id;
    session_key;
    session_id;
    timestamp;
    duration_ms;
    status;
    agent_usage_rolled_up_at;
    autofix_status;
    error_message;
    error_http_status;
    error_code;
    error_origin;
    error_class;
    requested_model;
    api_mode;
    caller_attribution;
    request_headers;
    request_params;
    feedback_rating;
    feedback_tags;
    feedback_details;
};
exports.ManifestRequest = ManifestRequest;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], ManifestRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "agent_name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "trace_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "session_key", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], ManifestRequest.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "duration_ms", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], ManifestRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "agent_usage_rolled_up_at", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "autofix_status", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "error_http_status", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 8, nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "error_code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "error_origin", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "error_class", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "requested_model", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "api_mode", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "caller_attribution", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "request_headers", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "request_params", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "feedback_rating", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "feedback_tags", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], ManifestRequest.prototype, "feedback_details", void 0);
exports.ManifestRequest = ManifestRequest = __decorate([
    (0, typeorm_1.Entity)('requests'),
    (0, typeorm_1.Index)(['tenant_id', 'agent_id', 'timestamp']),
    (0, typeorm_1.Index)(['tenant_id', 'timestamp']),
    (0, typeorm_1.Index)(['tenant_id', 'trace_id']),
    (0, typeorm_1.Index)(['tenant_id', 'status', 'timestamp'])
], ManifestRequest);
//# sourceMappingURL=request.entity.js.map