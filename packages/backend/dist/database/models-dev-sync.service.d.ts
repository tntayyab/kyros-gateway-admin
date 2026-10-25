import { OnModuleInit } from '@nestjs/common';
import { type ModelCapability, type ModelModality } from 'manifest-shared';
export interface ModelsDevTimeTier {
    windows: readonly string[];
    days: readonly number[] | null;
    inputPricePerToken: number | null;
    outputPricePerToken: number | null;
    cacheReadPricePerToken: number | null;
    cacheWritePricePerToken: number | null;
}
export interface ModelsDevModelEntry {
    id: string;
    name: string;
    family?: string;
    reasoning?: boolean;
    toolCall?: boolean;
    structuredOutput?: boolean;
    contextWindow?: number;
    maxOutputTokens?: number;
    inputPricePerToken: number | null;
    outputPricePerToken: number | null;
    cacheReadPricePerToken?: number | null;
    cacheWritePricePerToken?: number | null;
    timeTiers?: readonly ModelsDevTimeTier[] | null;
    capabilities: readonly ModelCapability[];
    inputModalities: readonly ModelModality[];
    outputModalities: readonly ModelModality[];
}
export declare class ModelsDevSyncService implements OnModuleInit {
    private readonly logger;
    private cache;
    private capabilityCache;
    private customProviderCache;
    private customProviderIndex;
    private lastFetchedAt;
    private initialLoad;
    onModuleInit(): void;
    whenInitialized(): Promise<void>;
    refreshCache(): Promise<number>;
    lookupModel(providerId: string, modelId: string): ModelsDevModelEntry | null;
    lookupCustomProviderModel(providerName: string, modelId: string): ModelsDevModelEntry | null;
    lookupModelCapabilities(providerId: string, modelId: string): ModelsDevModelEntry | null;
    lookupModelAcrossProviders(modelId: string): ModelsDevModelEntry | null;
    private lookupProviderScopedModel;
    private lookupModelInProvider;
    private lookupVersionedModelVariant;
    private applyModelIdPrefixAlias;
    private resolveCustomProviderKey;
    getModelsForProvider(providerId: string): ModelsDevModelEntry[];
    isProviderSupported(providerId: string): boolean;
    getLastFetchedAt(): Date | null;
    private indexCustomProvider;
    private addCustomProviderIndexEntry;
    private parseTierDays;
    private parseTimeTiers;
    private parseModel;
    private isChatCompatible;
    private fetchModelsDevData;
}
