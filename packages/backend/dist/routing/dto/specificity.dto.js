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
exports.ToggleSpecificityDto = exports.SetSpecificityOverrideDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const manifest_shared_1 = require("manifest-shared");
const routing_dto_1 = require("./routing.dto");
class SetSpecificityOverrideDto {
    model;
    provider;
    authType;
    providerKeyLabel;
    route;
}
exports.SetSpecificityOverrideDto = SetSpecificityOverrideDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetSpecificityOverrideDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetSpecificityOverrideDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], SetSpecificityOverrideDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(routing_dto_1.MAX_PROVIDER_KEY_LABEL_LENGTH),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SetSpecificityOverrideDto.prototype, "providerKeyLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => routing_dto_1.ModelRouteDto),
    __metadata("design:type", routing_dto_1.ModelRouteDto)
], SetSpecificityOverrideDto.prototype, "route", void 0);
class ToggleSpecificityDto {
    active;
}
exports.ToggleSpecificityDto = ToggleSpecificityDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleSpecificityDto.prototype, "active", void 0);
//# sourceMappingURL=specificity.dto.js.map