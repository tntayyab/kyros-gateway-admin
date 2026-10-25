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
exports.UpdateRecordingDto = exports.UpdateAutofixDto = exports.SetResponseModeDto = exports.SetFallbacksDto = exports.CopilotPollDto = exports.SetOverrideDto = exports.ReorderProviderKeysDto = exports.RenameProviderKeyDto = exports.RemoveProviderQueryDto = exports.ProviderKeyParamDto = exports.AgentProviderKeyParamDto = exports.AgentProviderParamDto = exports.ConnectProviderDto = exports.ProviderParamDto = exports.TierParamDto = exports.AgentNameParamDto = exports.ModelRouteDto = exports.MAX_PROVIDER_KEY_LABEL_LENGTH = void 0;
exports.responseModeFromDto = responseModeFromDto;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const manifest_shared_1 = require("manifest-shared");
const providers_1 = require("../../common/constants/providers");
const KNOWN_PROVIDER_IDS = Array.from(providers_1.PROVIDER_BY_ID_OR_ALIAS.keys());
exports.MAX_PROVIDER_KEY_LABEL_LENGTH = 50;
const CUSTOM_PROVIDER_KEY = /^custom:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
class ModelRouteDto {
    provider;
    authType;
    model;
    keyLabel;
}
exports.ModelRouteDto = ModelRouteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModelRouteDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], ModelRouteDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModelRouteDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(exports.MAX_PROVIDER_KEY_LABEL_LENGTH),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], ModelRouteDto.prototype, "keyLabel", void 0);
class AgentNameParamDto {
    agentName;
}
exports.AgentNameParamDto = AgentNameParamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_-]+$/, { message: 'Invalid agent name' }),
    __metadata("design:type", String)
], AgentNameParamDto.prototype, "agentName", void 0);
class TierParamDto {
    tier;
}
exports.TierParamDto = TierParamDto;
__decorate([
    (0, class_validator_1.IsIn)(manifest_shared_1.TIER_SLOTS),
    __metadata("design:type", String)
], TierParamDto.prototype, "tier", void 0);
class ProviderParamDto {
    provider;
}
exports.ProviderParamDto = ProviderParamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProviderParamDto.prototype, "provider", void 0);
class ConnectProviderDto {
    provider;
    apiKey;
    authType;
    region;
    baseUrl;
    base_url;
    label;
}
exports.ConnectProviderDto = ConnectProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    (0, class_validator_1.ValidateBy)({
        name: 'isConnectableProvider',
        validator: {
            validate: (value) => typeof value === 'string' &&
                (KNOWN_PROVIDER_IDS.includes(value) || CUSTOM_PROVIDER_KEY.test(value)),
            defaultMessage: () => `provider must be one of: ${KNOWN_PROVIDER_IDS.join(', ')}, or custom:<id>`,
        },
    }),
    __metadata("design:type", String)
], ConnectProviderDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectProviderDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], ConnectProviderDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectProviderDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectProviderDto.prototype, "baseUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectProviderDto.prototype, "base_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(exports.MAX_PROVIDER_KEY_LABEL_LENGTH),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], ConnectProviderDto.prototype, "label", void 0);
class AgentProviderParamDto {
    agentName;
    provider;
}
exports.AgentProviderParamDto = AgentProviderParamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_-]+$/, { message: 'Invalid agent name' }),
    __metadata("design:type", String)
], AgentProviderParamDto.prototype, "agentName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AgentProviderParamDto.prototype, "provider", void 0);
class AgentProviderKeyParamDto {
    agentName;
    provider;
    label;
}
exports.AgentProviderKeyParamDto = AgentProviderKeyParamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_-]+$/, { message: 'Invalid agent name' }),
    __metadata("design:type", String)
], AgentProviderKeyParamDto.prototype, "agentName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AgentProviderKeyParamDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(exports.MAX_PROVIDER_KEY_LABEL_LENGTH),
    __metadata("design:type", String)
], AgentProviderKeyParamDto.prototype, "label", void 0);
class ProviderKeyParamDto {
    provider;
    label;
}
exports.ProviderKeyParamDto = ProviderKeyParamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProviderKeyParamDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(exports.MAX_PROVIDER_KEY_LABEL_LENGTH),
    __metadata("design:type", String)
], ProviderKeyParamDto.prototype, "label", void 0);
class RemoveProviderQueryDto {
    authType;
    label;
}
exports.RemoveProviderQueryDto = RemoveProviderQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], RemoveProviderQueryDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(exports.MAX_PROVIDER_KEY_LABEL_LENGTH),
    __metadata("design:type", String)
], RemoveProviderQueryDto.prototype, "label", void 0);
class RenameProviderKeyDto {
    newLabel;
    authType;
}
exports.RenameProviderKeyDto = RenameProviderKeyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(exports.MAX_PROVIDER_KEY_LABEL_LENGTH),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], RenameProviderKeyDto.prototype, "newLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], RenameProviderKeyDto.prototype, "authType", void 0);
class ReorderProviderKeysDto {
    labels;
    authType;
}
exports.ReorderProviderKeysDto = ReorderProviderKeysDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(5),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], ReorderProviderKeysDto.prototype, "labels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], ReorderProviderKeysDto.prototype, "authType", void 0);
class SetOverrideDto {
    model;
    provider;
    authType;
    providerKeyLabel;
    route;
}
exports.SetOverrideDto = SetOverrideDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetOverrideDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetOverrideDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], SetOverrideDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(exports.MAX_PROVIDER_KEY_LABEL_LENGTH),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SetOverrideDto.prototype, "providerKeyLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModelRouteDto),
    __metadata("design:type", ModelRouteDto)
], SetOverrideDto.prototype, "route", void 0);
class CopilotPollDto {
    deviceCode;
}
exports.CopilotPollDto = CopilotPollDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CopilotPollDto.prototype, "deviceCode", void 0);
class SetFallbacksDto {
    models;
    routes;
}
exports.SetFallbacksDto = SetFallbacksDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(5),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], SetFallbacksDto.prototype, "models", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(5),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ModelRouteDto),
    __metadata("design:type", Array)
], SetFallbacksDto.prototype, "routes", void 0);
class SetResponseModeDto {
    response_mode;
    responseMode;
}
exports.SetResponseModeDto = SetResponseModeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.RESPONSE_MODES),
    __metadata("design:type", String)
], SetResponseModeDto.prototype, "response_mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.RESPONSE_MODES),
    __metadata("design:type", String)
], SetResponseModeDto.prototype, "responseMode", void 0);
function responseModeFromDto(body) {
    return body.response_mode ?? body.responseMode;
}
class UpdateAutofixDto {
    enabled;
}
exports.UpdateAutofixDto = UpdateAutofixDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAutofixDto.prototype, "enabled", void 0);
class UpdateRecordingDto {
    enabled;
}
exports.UpdateRecordingDto = UpdateRecordingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRecordingDto.prototype, "enabled", void 0);
//# sourceMappingURL=routing.dto.js.map