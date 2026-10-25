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
exports.MessagesQueryDto = exports.MESSAGE_ORIGIN_FILTER_VALUES = exports.MESSAGE_TRIGGER_FILTER_VALUES = exports.MESSAGE_STATUS_FILTER_VALUES = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const manifest_shared_1 = require("manifest-shared");
exports.MESSAGE_STATUS_FILTER_VALUES = [
    'success',
    'ok',
    'failed',
    'cancelled',
    'error',
    'rate_limited',
    'fallback_error',
    'errors',
];
exports.MESSAGE_TRIGGER_FILTER_VALUES = ['none', 'fallback', 'autofix'];
exports.MESSAGE_ORIGIN_FILTER_VALUES = [...manifest_shared_1.ERROR_ORIGINS, 'manifest'];
class MessagesQueryDto {
    range;
    provider;
    connections;
    model;
    service_type;
    cost_min;
    cost_max;
    limit;
    cursor;
    agent_name;
    status;
    attempts;
    trigger;
    origin;
    error_class;
    routing_tier;
    specificity_category;
    header_tier_id;
    include_total;
    cache_total;
    include_filter_options;
}
exports.MessagesQueryDto = MessagesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "range", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "connections", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "service_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MessagesQueryDto.prototype, "cost_min", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(999999),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MessagesQueryDto.prototype, "cost_max", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MessagesQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "agent_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.MESSAGE_STATUS_FILTER_VALUES, {
        message: `status must be one of: ${exports.MESSAGE_STATUS_FILTER_VALUES.join(', ')}`,
    }),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(has_failed|has_succeeded)(,(has_failed|has_succeeded))*$/, {
        message: 'attempts must be a comma-separated list of: has_failed, has_succeeded',
    }),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "attempts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(none|fallback|autofix)(,(none|fallback|autofix))*$/, {
        message: `trigger must be a comma-separated list of: ${exports.MESSAGE_TRIGGER_FILTER_VALUES.join(', ')}`,
    }),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "trigger", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.MESSAGE_ORIGIN_FILTER_VALUES, {
        message: `origin must be one of: ${exports.MESSAGE_ORIGIN_FILTER_VALUES.join(', ')}`,
    }),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "origin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.ERROR_CLASSES, {
        message: `error_class must be one of: ${manifest_shared_1.ERROR_CLASSES.join(', ')}`,
    }),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "error_class", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.ALL_TIERS, {
        message: `routing_tier must be one of: ${manifest_shared_1.ALL_TIERS.join(', ')}`,
    }),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "routing_tier", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.SPECIFICITY_CATEGORIES, {
        message: `specificity_category must be one of: ${manifest_shared_1.SPECIFICITY_CATEGORIES.join(', ')}`,
    }),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "specificity_category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessagesQueryDto.prototype, "header_tier_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    __metadata("design:type", Boolean)
], MessagesQueryDto.prototype, "include_total", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    __metadata("design:type", Boolean)
], MessagesQueryDto.prototype, "cache_total", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    __metadata("design:type", Boolean)
], MessagesQueryDto.prototype, "include_filter_options", void 0);
//# sourceMappingURL=messages-query.dto.js.map