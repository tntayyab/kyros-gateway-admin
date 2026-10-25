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
exports.ErrorPagesService = exports.MIN_TENANTS_FOR_PUBLIC = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const public_error_page_entity_1 = require("../entities/public-error-page.entity");
const secret_scrub_1 = require("../common/utils/secret-scrub");
exports.MIN_TENANTS_FOR_PUBLIC = 10;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
function scrubForPublic(text) {
    return (0, secret_scrub_1.scrubSecrets)(text ?? '').replace(EMAIL_RE, '[email]');
}
function isCustomProvider(provider) {
    return /^custom($|[:/])/i.test(provider);
}
let ErrorPagesService = class ErrorPagesService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    listPublished() {
        return this.repo.find({ order: { published_at: 'DESC' } });
    }
    getBySlug(slug) {
        return this.repo.findOne({ where: { slug } });
    }
    async upsert(dto) {
        if (isCustomProvider(dto.provider)) {
            throw new common_1.BadRequestException(`Refusing to publish "${dto.slug}": custom providers are tenant-specific and cannot be public pages.`);
        }
        const tenants = Number(dto.stats?.tenants ?? 0);
        if (!Number.isFinite(tenants) || tenants < exports.MIN_TENANTS_FOR_PUBLIC) {
            throw new common_1.BadRequestException(`Refusing to publish "${dto.slug}": cluster affects ${tenants} tenants, below the k-anonymity floor of ${exports.MIN_TENANTS_FOR_PUBLIC}.`);
        }
        const now = new Date().toISOString();
        const existing = await this.repo.findOne({ where: { slug: dto.slug } });
        const row = {
            slug: dto.slug,
            cluster_key: dto.cluster_key,
            provider: dto.provider,
            provider_label: dto.provider_label ?? dto.provider,
            http_status: dto.http_status ?? null,
            category: dto.category ?? 'unknown',
            category_label: dto.category_label ?? '',
            title: dto.title,
            meta_description: dto.meta_description,
            h1: dto.h1,
            body_what: dto.body_what ?? '',
            body_fix: dto.body_fix ?? '',
            body_manifest: dto.body_manifest ?? '',
            sample_message: scrubForPublic(dto.sample_message),
            faq: dto.faq ?? [],
            stats: dto.stats,
            related: dto.related ?? [],
            noindex: dto.noindex ?? false,
            published_at: existing?.published_at ?? now,
            updated_at: now,
        };
        await this.repo.save(row);
        return { ok: true, slug: dto.slug };
    }
    async remove(slug) {
        await this.repo.delete({ slug });
        return { ok: true, slug };
    }
};
exports.ErrorPagesService = ErrorPagesService;
exports.ErrorPagesService = ErrorPagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(public_error_page_entity_1.PublicErrorPage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ErrorPagesService);
//# sourceMappingURL=error-pages.service.js.map