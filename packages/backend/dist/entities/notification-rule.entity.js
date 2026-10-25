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
exports.NotificationRule = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let NotificationRule = class NotificationRule {
    id;
    tenant_id;
    agent_id;
    agent_name;
    metric_type;
    threshold;
    period;
    action;
    is_active;
    created_at;
    updated_at;
};
exports.NotificationRule = NotificationRule;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], NotificationRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationRule.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationRule.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationRule.prototype, "agent_name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationRule.prototype, "metric_type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 6 }),
    __metadata("design:type", Number)
], NotificationRule.prototype, "threshold", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationRule.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'notify' }),
    __metadata("design:type", String)
], NotificationRule.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], NotificationRule.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], NotificationRule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], NotificationRule.prototype, "updated_at", void 0);
exports.NotificationRule = NotificationRule = __decorate([
    (0, typeorm_1.Entity)('notification_rules'),
    (0, typeorm_1.Index)(['tenant_id', 'agent_id']),
    (0, typeorm_1.Index)(['tenant_id', 'agent_name'])
], NotificationRule);
//# sourceMappingURL=notification-rule.entity.js.map