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
exports.InternalErrorPagesController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../common/decorators/public.decorator");
const error_pages_service_1 = require("./error-pages.service");
const error_discovery_service_1 = require("./error-discovery.service");
const upsert_error_page_dto_1 = require("./dto/upsert-error-page.dto");
let InternalErrorPagesController = class InternalErrorPagesController {
    service;
    discovery;
    config;
    constructor(service, discovery, config) {
        this.service = service;
        this.discovery = discovery;
        this.config = config;
    }
    assertSecret(provided) {
        const expected = this.config.get('app.errorPagePushSecret') ?? '';
        if (!expected || provided !== expected) {
            throw new common_1.UnauthorizedException('Invalid or missing push secret');
        }
    }
    async clusters(secret) {
        this.assertSecret(secret);
        return this.discovery.discover();
    }
    async upsert(secret, dto) {
        this.assertSecret(secret);
        return this.service.upsert(dto);
    }
    async remove(secret, slug) {
        this.assertSecret(secret);
        return this.service.remove(slug);
    }
};
exports.InternalErrorPagesController = InternalErrorPagesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('clusters'),
    __param(0, (0, common_1.Headers)('x-internal-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InternalErrorPagesController.prototype, "clusters", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('x-internal-secret')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_error_page_dto_1.UpsertErrorPageDto]),
    __metadata("design:returntype", Promise)
], InternalErrorPagesController.prototype, "upsert", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Delete)(':slug'),
    __param(0, (0, common_1.Headers)('x-internal-secret')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InternalErrorPagesController.prototype, "remove", null);
exports.InternalErrorPagesController = InternalErrorPagesController = __decorate([
    (0, common_1.Controller)('api/v1/internal/error-pages'),
    __metadata("design:paramtypes", [error_pages_service_1.ErrorPagesService,
        error_discovery_service_1.ErrorDiscoveryService,
        config_1.ConfigService])
], InternalErrorPagesController);
//# sourceMappingURL=internal-error-pages.controller.js.map