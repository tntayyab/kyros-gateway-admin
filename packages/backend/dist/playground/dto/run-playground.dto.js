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
exports.RunPlaygroundDto = exports.PlaygroundPayloadShapeConstraint = exports.PlaygroundMessageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const manifest_shared_1 = require("manifest-shared");
class PlaygroundMessageDto {
    role;
    content;
}
exports.PlaygroundMessageDto = PlaygroundMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['system', 'user', 'assistant']),
    __metadata("design:type", String)
], PlaygroundMessageDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50_000),
    __metadata("design:type", String)
], PlaygroundMessageDto.prototype, "content", void 0);
let PlaygroundPayloadShapeConstraint = class PlaygroundPayloadShapeConstraint {
    validate(_value, args) {
        const obj = args.object;
        const hasMessages = Array.isArray(obj.messages) && obj.messages.length > 0;
        const hasRaw = obj.rawRequestBody != null &&
            typeof obj.rawRequestBody === 'object' &&
            !Array.isArray(obj.rawRequestBody);
        return hasMessages !== hasRaw;
    }
    defaultMessage() {
        return 'exactly one of `messages` or `rawRequestBody` must be provided';
    }
};
exports.PlaygroundPayloadShapeConstraint = PlaygroundPayloadShapeConstraint;
exports.PlaygroundPayloadShapeConstraint = PlaygroundPayloadShapeConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'PlaygroundPayloadShape', async: false })
], PlaygroundPayloadShapeConstraint);
class RunPlaygroundDto {
    agentName;
    model;
    provider;
    authType;
    messages;
    rawRequestBody;
    runId;
    position;
    requestHeaders;
}
exports.RunPlaygroundDto = RunPlaygroundDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RunPlaygroundDto.prototype, "agentName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(PlaygroundPayloadShapeConstraint),
    __metadata("design:type", String)
], RunPlaygroundDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RunPlaygroundDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(manifest_shared_1.AUTH_TYPES),
    __metadata("design:type", String)
], RunPlaygroundDto.prototype, "authType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(50),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlaygroundMessageDto),
    __metadata("design:type", Array)
], RunPlaygroundDto.prototype, "messages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RunPlaygroundDto.prototype, "rawRequestBody", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RunPlaygroundDto.prototype, "runId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], RunPlaygroundDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RunPlaygroundDto.prototype, "requestHeaders", void 0);
//# sourceMappingURL=run-playground.dto.js.map