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
exports.NotificationLog = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let NotificationLog = class NotificationLog {
    id;
    rule_id;
    period_start;
    period_end;
    actual_value;
    threshold_value;
    metric_type;
    agent_name;
    sent_at;
};
exports.NotificationLog = NotificationLog;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], NotificationLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationLog.prototype, "rule_id", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], NotificationLog.prototype, "period_start", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], NotificationLog.prototype, "period_end", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 6 }),
    __metadata("design:type", Number)
], NotificationLog.prototype, "actual_value", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 6 }),
    __metadata("design:type", Number)
], NotificationLog.prototype, "threshold_value", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationLog.prototype, "metric_type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NotificationLog.prototype, "agent_name", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], NotificationLog.prototype, "sent_at", void 0);
exports.NotificationLog = NotificationLog = __decorate([
    (0, typeorm_1.Entity)('notification_logs'),
    (0, typeorm_1.Index)(['rule_id', 'period_start'], { unique: true })
], NotificationLog);
//# sourceMappingURL=notification-log.entity.js.map