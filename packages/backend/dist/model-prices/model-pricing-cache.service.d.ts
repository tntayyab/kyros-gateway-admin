import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PricingSyncService } from '../database/pricing-sync.service';
import { ModelsDevSyncService } from '../database/models-dev-sync.service';
import { ProviderModelRegistryService } from '../model-discovery/provider-model-registry.service';
import { CustomProvider } from '../entities/custom-provider.entity';
export interface PricingTimeTier {
    windows: readonly string[];
    days?: readonly number[] | null;
    input_price_per_token: number | null;
    output_price_per_token: number | null;
    cache_read_price_per_token?: number | null;
    cache_write_price_per_token?: number | null;
}
export interface PricingEntry {
    model_name: string;
    provider: string;
    input_price_per_token: number | null;
    output_price_per_token: number | null;
    cache_read_price_per_token?: number | null;
    cache_write_price_per_token?: number | null;
    time_tiers?: readonly PricingTimeTier[] | null;
    display_name: string | null;
    validated?: boolean;
    source?: 'models.dev' | 'openrouter' | 'custom';
}
export declare class ModelPricingCacheService implements OnApplicationBootstrap {
    private readonly pricingSync;
    private readonly modelsDevSync;
    private readonly modelRegistry;
    private readonly customProviderRepo;
    private readonly logger;
    private readonly cache;
    private readonly providerScoped;
    private aliasMap;
    private static scopedKey;
    private static readonly PROVIDER_BY_DISPLAY_NAME;
    private static resolveProviderId;
    constructor(pricingSync: PricingSyncService, modelsDevSync: ModelsDevSyncService | null, modelRegistry: ProviderModelRegistryService | null, customProviderRepo?: Repository<CustomProvider> | null);
    onApplicationBootstrap(): void;
    private warmup;
    scheduledReload(): Promise<void>;
    reload(): Promise<void>;
    getByModel(modelName: string, provider?: string | null): PricingEntry | undefined;
    private getProviderScoped;
    getAll(): PricingEntry[];
    private resolveProviderAndName;
    private loadModelsDevEntries;
    private loadCustomProviderEntries;
    private resolveValidated;
    private resolveValidatedForModelsDev;
}
