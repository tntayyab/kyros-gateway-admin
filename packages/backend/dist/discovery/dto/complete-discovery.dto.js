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
exports.CompleteDiscoveryDto = void 0;
const class_validator_1 = require("class-validator");
const PROJECT_TYPES = [
    'ai_product',
    'ai_agent',
    'internal_tool',
    'workflow_platform',
    'personal_project',
    'other',
];
const COMPANY_SIZES = ['not_for_work', '1-20', '21-100', '101-500', '501-1000', '1000+'];
class CompleteDiscoveryDto {
    name;
    email;
    projectType;
    companySize;
}
exports.CompleteDiscoveryDto = CompleteDiscoveryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CompleteDiscoveryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], CompleteDiscoveryDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(PROJECT_TYPES),
    __metadata("design:type", String)
], CompleteDiscoveryDto.prototype, "projectType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(COMPANY_SIZES),
    __metadata("design:type", String)
], CompleteDiscoveryDto.prototype, "companySize", void 0);
//# sourceMappingURL=complete-discovery.dto.js.map