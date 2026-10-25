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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const setup_service_1 = require("./setup.service");
let SetupController = class SetupController {
    setupService;
    constructor(setupService) {
        this.setupService = setupService;
    }
    async getStatus() {
        const selfHosted = this.setupService.isSelfHosted();
        const ollamaAvailable = selfHosted ? await this.setupService.isOllamaAvailable() : false;
        return {
            needsSetup: await this.setupService.needsSetup(),
            socialProviders: this.setupService.getEnabledSocialProviders(),
            isSelfHosted: selfHosted,
            ollamaAvailable,
            localLlmHost: this.setupService.getLocalLlmHost(),
            emailConfigured: this.setupService.isEmailConfigured(),
            mcpEnabled: this.setupService.isMcpEnabled(),
        };
    }
    async createAdmin(dto) {
        await this.setupService.createFirstAdmin(dto);
        return { ok: true };
    }
};
exports.SetupController = SetupController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "getStatus", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "createAdmin", null);
exports.SetupController = SetupController = __decorate([
    (0, common_1.Controller)('api/v1/setup'),
    __metadata("design:paramtypes", [setup_service_1.SetupService])
], SetupController);
//# sourceMappingURL=setup.controller.js.map