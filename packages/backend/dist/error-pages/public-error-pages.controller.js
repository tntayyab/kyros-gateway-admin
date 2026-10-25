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
exports.PublicErrorPagesController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../common/decorators/public.decorator");
const error_pages_service_1 = require("./error-pages.service");
let PublicErrorPagesController = class PublicErrorPagesController {
    service;
    config;
    constructor(service, config) {
        this.service = service;
        this.config = config;
    }
    assertEnabled() {
        if (!this.config.get('app.publicErrorPagesEnabled')) {
            throw new common_1.NotFoundException();
        }
    }
    async list() {
        this.assertEnabled();
        const pages = await this.service.listPublished();
        return {
            pages: pages.map((p) => ({
                slug: p.slug,
                title: p.title,
                h1: p.h1,
                meta_description: p.meta_description,
                provider: p.provider,
                provider_label: p.provider_label,
                http_status: p.http_status,
                category: p.category,
                category_label: p.category_label,
                stats: p.stats,
                noindex: p.noindex,
                published_at: p.published_at,
                updated_at: p.updated_at,
            })),
            cached_at: new Date().toISOString(),
        };
    }
    async detail(slug) {
        this.assertEnabled();
        const page = await this.service.getBySlug(slug);
        if (!page)
            throw new common_1.NotFoundException();
        return page;
    }
};
exports.PublicErrorPagesController = PublicErrorPagesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicErrorPagesController.prototype, "list", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicErrorPagesController.prototype, "detail", null);
exports.PublicErrorPagesController = PublicErrorPagesController = __decorate([
    (0, common_1.Controller)('api/v1/public/error-pages'),
    __metadata("design:paramtypes", [error_pages_service_1.ErrorPagesService,
        config_1.ConfigService])
], PublicErrorPagesController);
//# sourceMappingURL=public-error-pages.controller.js.map