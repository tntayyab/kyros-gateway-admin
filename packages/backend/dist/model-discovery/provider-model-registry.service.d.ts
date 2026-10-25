import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TenantProvider } from '../entities/tenant-provider.entity';
import type { DiscoveredModel } from './model-fetcher';
export interface ProviderModelRegistryEntry {
    id: string;
    supportedEndpoints?: readonly string[];
}
type ProviderModelRegistration = string | Pick<DiscoveredModel, 'id' | 'supportedEndpoints'>;
export declare const CACHE_LOAD_BATCH_SIZE = 500;
export declare class ProviderModelRegistryService implements OnApplicationBootstrap {
    private readonly providerRepo;
    private readonly logger;
    private readonly registry;
    private cacheLoad;
    constructor(providerRepo: Repository<TenantProvider>);
    onApplicationBootstrap(): void;
    whenLoaded(): Promise<void>;
    registerModels(providerId: string, models: ProviderModelRegistration[]): void;
    private registerInto;
    getConfirmedModels(providerId: string): ReadonlySet<string> | null;
    isModelConfirmed(providerId: string, modelId: string): boolean | null;
    getModelMetadata(providerId: string, modelId: string): ProviderModelRegistryEntry | null;
    private loadFromCache;
    private fetchPage;
    private toRegistryEntry;
}
export {};
