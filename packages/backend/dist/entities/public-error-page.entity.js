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
exports.PublicErrorPage = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let PublicErrorPage = class PublicErrorPage {
    slug;
    cluster_key;
    provider;
    provider_label;
    http_status;
    category;
    category_label;
    title;
    meta_description;
    h1;
    body_what;
    body_fix;
    body_manifest;
    sample_message;
    faq;
    stats;
    related;
    noindex;
    published_at;
    updated_at;
};
exports.PublicErrorPage = PublicErrorPage;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "cluster_key", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: '' }),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "provider_label", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], PublicErrorPage.prototype, "http_status", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'unknown' }),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: '' }),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "category_label", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "meta_description", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "h1", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: '' }),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "body_what", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: '' }),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "body_fix", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: '' }),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "body_manifest", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: '' }),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "sample_message", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], PublicErrorPage.prototype, "faq", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], PublicErrorPage.prototype, "stats", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], PublicErrorPage.prototype, "related", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], PublicErrorPage.prototype, "noindex", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "published_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], PublicErrorPage.prototype, "updated_at", void 0);
exports.PublicErrorPage = PublicErrorPage = __decorate([
    (0, typeorm_1.Entity)('public_error_pages')
], PublicErrorPage);
//# sourceMappingURL=public-error-page.entity.js.map