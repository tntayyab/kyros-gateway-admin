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
exports.PivotClaimDto = exports.DEFAULT_PIVOT_CLAIM_SOURCE = exports.PIVOT_CLAIM_SOURCES = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.PIVOT_CLAIM_SOURCES = ['cloud', 'self-hosted'];
exports.DEFAULT_PIVOT_CLAIM_SOURCE = 'self-hosted';
class PivotClaimDto {
    email;
    source;
}
exports.PivotClaimDto = PivotClaimDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], PivotClaimDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((claim) => claim.source !== undefined),
    (0, class_validator_1.IsIn)([...exports.PIVOT_CLAIM_SOURCES]),
    __metadata("design:type", String)
], PivotClaimDto.prototype, "source", void 0);
//# sourceMappingURL=pivot-claim.dto.js.map