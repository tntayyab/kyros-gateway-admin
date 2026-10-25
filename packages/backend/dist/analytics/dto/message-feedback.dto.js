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
exports.MessageFeedbackDto = exports.FEEDBACK_TAGS = exports.FEEDBACK_RATINGS = void 0;
const class_validator_1 = require("class-validator");
exports.FEEDBACK_RATINGS = ['like', 'dislike'];
exports.FEEDBACK_TAGS = [
    'Not expected tier',
    'Poor answer quality',
    'Too slow',
    'Buggy',
    'Other',
];
class MessageFeedbackDto {
    rating;
    tags;
    details;
}
exports.MessageFeedbackDto = MessageFeedbackDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.FEEDBACK_RATINGS),
    __metadata("design:type", String)
], MessageFeedbackDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MessageFeedbackDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], MessageFeedbackDto.prototype, "details", void 0);
//# sourceMappingURL=message-feedback.dto.js.map