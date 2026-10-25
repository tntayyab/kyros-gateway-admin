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
exports.ModelPricesService = void 0;
const common_1 = require("@nestjs/common");
const model_pricing_cache_service_1 = require("./model-pricing-cache.service");
const pricing_sync_service_1 = require("../database/pricing-sync.service");
let ModelPricesService = class ModelPricesService {
    pricingCache;
    pricingSync;
    constructor(pricingCache, pricingSync) {
        this.pricingCache = pricingCache;
        this.pricingSync = pricingSync;
    }
    getAll() {
        const entries = this.pricingCache.getAll();
        const lastSyncedAt = this.pricingSync.getLastFetchedAt()?.toISOString() ?? null;
        return {
            models: entries.map((r) => ({
                model_name: r.model_name,
                provider: r.provider || 'Unknown',
                input_price_per_million: r.input_price_per_token != null ? Number(r.input_price_per_token) * 1_000_000 : null,
                output_price_per_million: r.output_price_per_token != null ? Number(r.output_price_per_token) * 1_000_000 : null,
                display_name: r.display_name || null,
                validated: r.validated,
            })),
            lastSyncedAt,
        };
    }
};
exports.ModelPricesService = ModelPricesService;
exports.ModelPricesService = ModelPricesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [model_pricing_cache_service_1.ModelPricingCacheService,
        pricing_sync_service_1.PricingSyncService])
], ModelPricesService);
//# sourceMappingURL=model-prices.service.js.map