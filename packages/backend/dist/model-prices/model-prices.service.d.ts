import { ModelPricingCacheService } from './model-pricing-cache.service';
import { PricingSyncService } from '../database/pricing-sync.service';
export declare class ModelPricesService {
    private readonly pricingCache;
    private readonly pricingSync;
    constructor(pricingCache: ModelPricingCacheService, pricingSync: PricingSyncService);
    getAll(): {
        models: {
            model_name: string;
            provider: string;
            input_price_per_million: number | null;
            output_price_per_million: number | null;
            display_name: string | null;
            validated: boolean | undefined;
        }[];
        lastSyncedAt: string | null;
    };
}
