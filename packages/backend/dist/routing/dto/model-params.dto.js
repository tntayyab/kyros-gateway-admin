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
exports.UpdateTierModelParamsBodyDto = exports.TierModelParamsQueryDto = exports.TierModelParamsPathDto = exports.ModelParamSpecsQueryDto = exports.DeleteModelParamsBodyDto = exports.SetModelParamsBodyDto = void 0;
const class_validator_1 = require("class-validator");
const manifest_shared_1 = require("manifest-shared");
const MAX_REQUEST_PARAM_DEPTH = 100;
let RequestParamDefaultsConstraint = class RequestParamDefaultsConstraint {
    validate(value) {
        return isJsonObject(value);
    }
    defaultMessage() {
        return 'params must be a JSON object';
    }
};
RequestParamDefaultsConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'requestParamDefaults', async: false })
], RequestParamDefaultsConstraint);
class SetModelParamsBodyDto {
    scope;
    provider;
    authType;
    model;
    params;
}
exports.SetModelParamsBodyDto = SetModelParamsBodyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetModelParamsBodyDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetModelParamsBodyDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], SetModelParamsBodyDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetModelParamsBodyDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.Validate)(RequestParamDefaultsConstraint),
    __metadata("design:type", Object)
], SetModelParamsBodyDto.prototype, "params", void 0);
class DeleteModelParamsBodyDto {
    scope;
    provider;
    authType;
    model;
}
exports.DeleteModelParamsBodyDto = DeleteModelParamsBodyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteModelParamsBodyDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteModelParamsBodyDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], DeleteModelParamsBodyDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteModelParamsBodyDto.prototype, "model", void 0);
class ModelParamSpecsQueryDto {
    provider;
    authType;
    model;
}
exports.ModelParamSpecsQueryDto = ModelParamSpecsQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModelParamSpecsQueryDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], ModelParamSpecsQueryDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModelParamSpecsQueryDto.prototype, "model", void 0);
class TierModelParamsPathDto {
    agentName;
    tier;
}
exports.TierModelParamsPathDto = TierModelParamsPathDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_-]+$/, { message: 'Invalid agent name' }),
    __metadata("design:type", String)
], TierModelParamsPathDto.prototype, "agentName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], TierModelParamsPathDto.prototype, "tier", void 0);
class TierModelParamsQueryDto {
    model;
}
exports.TierModelParamsQueryDto = TierModelParamsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TierModelParamsQueryDto.prototype, "model", void 0);
const MAX_PARAM_CHANGES = 50;
class UpdateTierModelParamsBodyDto {
    set;
    unset;
}
exports.UpdateTierModelParamsBodyDto = UpdateTierModelParamsBodyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.Validate)(RequestParamDefaultsConstraint),
    __metadata("design:type", Object)
], UpdateTierModelParamsBodyDto.prototype, "set", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(MAX_PARAM_CHANGES),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], UpdateTierModelParamsBodyDto.prototype, "unset", void 0);
function isJsonObject(value, depth = 0) {
    if (depth > MAX_REQUEST_PARAM_DEPTH)
        return false;
    return isRecord(value) && Object.values(value).every((item) => isJsonValue(item, depth + 1));
}
function isJsonValue(value, depth = 0) {
    if (depth > MAX_REQUEST_PARAM_DEPTH)
        return false;
    if (value === null)
        return true;
    if (typeof value === 'string' || typeof value === 'boolean')
        return true;
    if (typeof value === 'number')
        return Number.isFinite(value);
    if (Array.isArray(value))
        return value.every((item) => isJsonValue(item, depth + 1));
    return isJsonObject(value, depth);
}
function isRecord(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
//# sourceMappingURL=model-params.dto.js.map