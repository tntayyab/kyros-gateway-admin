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
exports.UpdateNotificationRuleDto = exports.CreateNotificationRuleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateNotificationRuleDto {
    agent_name;
    metric_type;
    threshold;
    period;
    action;
}
exports.CreateNotificationRuleDto = CreateNotificationRuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationRuleDto.prototype, "agent_name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['tokens', 'cost']),
    __metadata("design:type", String)
], CreateNotificationRuleDto.prototype, "metric_type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateNotificationRuleDto.prototype, "threshold", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['hour', 'day', 'week', 'month']),
    __metadata("design:type", String)
], CreateNotificationRuleDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['notify', 'block', 'both']),
    __metadata("design:type", String)
], CreateNotificationRuleDto.prototype, "action", void 0);
class UpdateNotificationRuleDto {
    metric_type;
    threshold;
    period;
    is_active;
    action;
}
exports.UpdateNotificationRuleDto = UpdateNotificationRuleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['tokens', 'cost']),
    __metadata("design:type", String)
], UpdateNotificationRuleDto.prototype, "metric_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateNotificationRuleDto.prototype, "threshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['hour', 'day', 'week', 'month']),
    __metadata("design:type", String)
], UpdateNotificationRuleDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], UpdateNotificationRuleDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['notify', 'block', 'both']),
    __metadata("design:type", String)
], UpdateNotificationRuleDto.prototype, "action", void 0);
//# sourceMappingURL=notification-rule.dto.js.map