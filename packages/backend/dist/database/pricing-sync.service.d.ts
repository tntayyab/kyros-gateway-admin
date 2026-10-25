import { OnModuleInit } from '@nestjs/common';
interface OpenRouterModel {
    id: string;
    name?: string;
    context_length?: number;
    architecture?: {
        input_modalities?: string[];
        output_modalities?: string[];
    };
    pricing?: {
        prompt?: string;
        completion?: string;
    };
}
export interface OpenRouterPricingEntry {
    input: number;
    output: number;
    contextWindow?: number;
    displayName?: string;
}
export declare class PricingSyncService implements OnModuleInit {
    private readonly logger;
    private cache;
    private lastFetchedAt;
    private initialLoad;
    onModuleInit(): void;
    whenInitialized(): Promise<void>;
    refreshCache(): Promise<number>;
    lookupPricing(modelId: string): OpenRouterPricingEntry | null;
    getAll(): ReadonlyMap<string, OpenRouterPricingEntry>;
    getLastFetchedAt(): Date | null;
    private fetchOpenRouterModels;
    extractDisplayName(model: OpenRouterModel): string;
    isChatCompatible(model: OpenRouterModel): boolean;
}
export {};
