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
exports.UpdateCustomProviderDto = exports.ProbeCustomProviderDto = exports.CreateCustomProviderDto = exports.CustomProviderModelDto = exports.CUSTOM_PROVIDER_MODEL_LIMIT = exports.CUSTOM_PROVIDER_API_KINDS = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const manifest_shared_1 = require("manifest-shared");
function AliasField() {
    const decorators = [
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? (0, manifest_shared_1.normalizeCustomProviderAlias)(value) : value),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(manifest_shared_1.CUSTOM_PROVIDER_ALIAS_MAX_LENGTH),
        (0, class_validator_1.Matches)(manifest_shared_1.CUSTOM_PROVIDER_ALIAS_PATTERN, { message: manifest_shared_1.CUSTOM_PROVIDER_ALIAS_MESSAGE }),
    ];
    return (target, propertyKey) => {
        for (const decorator of decorators)
            decorator(target, propertyKey);
    };
}
exports.CUSTOM_PROVIDER_API_KINDS = ['openai', 'anthropic'];
exports.CUSTOM_PROVIDER_MODEL_LIMIT = 500;
class CustomProviderModelDto {
    model_name;
    input_price_per_million_tokens;
    output_price_per_million_tokens;
    context_window;
    price_estimated;
}
exports.CustomProviderModelDto = CustomProviderModelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CustomProviderModelDto.prototype, "model_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CustomProviderModelDto.prototype, "input_price_per_million_tokens", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CustomProviderModelDto.prototype, "output_price_per_million_tokens", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CustomProviderModelDto.prototype, "context_window", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CustomProviderModelDto.prototype, "price_estimated", void 0);
class CreateCustomProviderDto {
    name;
    alias;
    base_url;
    api_kind;
    apiKey;
    models;
}
exports.CreateCustomProviderDto = CreateCustomProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9 ._-]+$/, {
        message: 'Name can only contain letters, numbers, spaces, dots, hyphens, and underscores',
    }),
    __metadata("design:type", String)
], CreateCustomProviderDto.prototype, "name", void 0);
__decorate([
    AliasField(),
    __metadata("design:type", Object)
], CreateCustomProviderDto.prototype, "alias", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)({ require_tld: false, require_protocol: true }, { message: 'Must be a valid URL' }),
    __metadata("design:type", String)
], CreateCustomProviderDto.prototype, "base_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.CUSTOM_PROVIDER_API_KINDS, { message: 'api_kind must be "openai" or "anthropic"' }),
    __metadata("design:type", String)
], CreateCustomProviderDto.prototype, "api_kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomProviderDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(exports.CUSTOM_PROVIDER_MODEL_LIMIT),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CustomProviderModelDto),
    __metadata("design:type", Array)
], CreateCustomProviderDto.prototype, "models", void 0);
class ProbeCustomProviderDto {
    base_url;
    provider_name;
    api_kind;
    apiKey;
    provider_id;
}
exports.ProbeCustomProviderDto = ProbeCustomProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)({ require_tld: false, require_protocol: true }, { message: 'Must be a valid URL' }),
    __metadata("design:type", String)
], ProbeCustomProviderDto.prototype, "base_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], ProbeCustomProviderDto.prototype, "provider_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.CUSTOM_PROVIDER_API_KINDS, { message: 'api_kind must be "openai" or "anthropic"' }),
    __metadata("design:type", String)
], ProbeCustomProviderDto.prototype, "api_kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProbeCustomProviderDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ProbeCustomProviderDto.prototype, "provider_id", void 0);
class UpdateCustomProviderDto {
    name;
    alias;
    base_url;
    api_kind;
    apiKey;
    models;
}
exports.UpdateCustomProviderDto = UpdateCustomProviderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9 ._-]+$/, {
        message: 'Name can only contain letters, numbers, spaces, dots, hyphens, and underscores',
    }),
    __metadata("design:type", String)
], UpdateCustomProviderDto.prototype, "name", void 0);
__decorate([
    AliasField(),
    __metadata("design:type", Object)
], UpdateCustomProviderDto.prototype, "alias", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)({ require_tld: false, require_protocol: true }, { message: 'Must be a valid URL' }),
    __metadata("design:type", String)
], UpdateCustomProviderDto.prototype, "base_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.CUSTOM_PROVIDER_API_KINDS, { message: 'api_kind must be "openai" or "anthropic"' }),
    __metadata("design:type", String)
], UpdateCustomProviderDto.prototype, "api_kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomProviderDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(exports.CUSTOM_PROVIDER_MODEL_LIMIT),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CustomProviderModelDto),
    __metadata("design:type", Array)
], UpdateCustomProviderDto.prototype, "models", void 0);
//# sourceMappingURL=custom-provider.dto.js.map