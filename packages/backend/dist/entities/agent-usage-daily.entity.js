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
exports.AgentUsageDaily = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let AgentUsageDaily = class AgentUsageDaily {
    tenant_id;
    agent_id;
    day;
    request_count;
    successful_request_count;
    failed_request_count;
    input_tokens;
    output_tokens;
    cost_usd;
    last_active_at;
    updated_at;
};
exports.AgentUsageDaily = AgentUsageDaily;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('date'),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "day", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "request_count", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "successful_request_count", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "failed_request_count", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "input_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "output_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "cost_usd", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { nullable: true }),
    __metadata("design:type", Object)
], AgentUsageDaily.prototype, "last_active_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], AgentUsageDaily.prototype, "updated_at", void 0);
exports.AgentUsageDaily = AgentUsageDaily = __decorate([
    (0, typeorm_1.Entity)('agent_usage_daily')
], AgentUsageDaily);
//# sourceMappingURL=agent-usage-daily.entity.js.map