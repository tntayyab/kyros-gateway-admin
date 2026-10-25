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
exports.TestSavedEmailProviderDto = exports.TestEmailProviderDto = exports.SetEmailProviderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SetEmailProviderDto {
    provider;
    apiKey;
    domain;
    notificationEmail;
}
exports.SetEmailProviderDto = SetEmailProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['resend', 'mailgun', 'sendgrid']),
    __metadata("design:type", String)
], SetEmailProviderDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SetEmailProviderDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.provider === 'mailgun'),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], SetEmailProviderDto.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], SetEmailProviderDto.prototype, "notificationEmail", void 0);
class TestEmailProviderDto {
    provider;
    apiKey;
    domain;
    to;
}
exports.TestEmailProviderDto = TestEmailProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['resend', 'mailgun', 'sendgrid']),
    __metadata("design:type", String)
], TestEmailProviderDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], TestEmailProviderDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.provider === 'mailgun'),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], TestEmailProviderDto.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], TestEmailProviderDto.prototype, "to", void 0);
class TestSavedEmailProviderDto {
    to;
}
exports.TestSavedEmailProviderDto = TestSavedEmailProviderDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], TestSavedEmailProviderDto.prototype, "to", void 0);
//# sourceMappingURL=set-email-provider.dto.js.map