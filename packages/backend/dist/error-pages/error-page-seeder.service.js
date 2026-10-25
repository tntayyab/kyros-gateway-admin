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
var ErrorPageSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorPageSeederService = void 0;
const common_1 = require("@nestjs/common");
const error_pages_service_1 = require("./error-pages.service");
const error_page_seed_data_1 = require("./error-page-seed-data");
let ErrorPageSeederService = ErrorPageSeederService_1 = class ErrorPageSeederService {
    pages;
    logger = new common_1.Logger(ErrorPageSeederService_1.name);
    constructor(pages) {
        this.pages = pages;
    }
    async onModuleInit() {
        if (process.env['SEED_DATA'] !== 'true')
            return;
        if (await this.pages.getBySlug(error_page_seed_data_1.ERROR_PAGE_SEEDS[0].slug))
            return;
        const now = Date.now();
        const nowIso = new Date(now).toISOString();
        for (let i = 0; i < error_page_seed_data_1.ERROR_PAGE_SEEDS.length; i++) {
            const s = error_page_seed_data_1.ERROR_PAGE_SEEDS[i];
            const stats = {
                tenants: s.tenants,
                volume_7d: s.volume_7d,
                volume_30d: s.volume_30d,
                recovery_rate: s.recovery_rate,
                last_seen: nowIso,
                trend: (0, error_page_seed_data_1.seedTrend)(s.volume_30d, i, now),
                variants: s.variants ?? [],
            };
            await this.pages.upsert({
                slug: s.slug,
                cluster_key: s.cluster_key,
                provider: s.provider,
                provider_label: s.provider_label,
                http_status: s.http_status,
                category: s.category,
                category_label: s.category_label,
                title: s.title,
                meta_description: s.meta_description,
                h1: s.h1,
                body_what: s.body_what,
                body_fix: s.body_fix,
                sample_message: s.sample_message,
                faq: s.faq,
                stats,
            });
        }
        this.logger.log(`Seeded ${error_page_seed_data_1.ERROR_PAGE_SEEDS.length} public error pages (dev demo, with trends)`);
    }
};
exports.ErrorPageSeederService = ErrorPageSeederService;
exports.ErrorPageSeederService = ErrorPageSeederService = ErrorPageSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [error_pages_service_1.ErrorPagesService])
], ErrorPageSeederService);
//# sourceMappingURL=error-page-seeder.service.js.map