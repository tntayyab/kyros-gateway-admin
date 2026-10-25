import { DiscoveredModel } from './model-fetcher';
interface PricingLookup {
    lookupPricing(key: string): {
        input: number;
        output: number;
        contextWindow?: number;
        displayName?: string;
    } | null;
    getAll(): ReadonlyMap<string, {
        input: number;
        output: number;
        contextWindow?: number;
        displayName?: string;
    }>;
}
export declare function findOpenRouterPrefix(providerId: string): string | null;
export declare function lookupWithVariants(pricingSync: PricingLookup, prefix: string, modelId: string): {
    input: number;
    output: number;
    contextWindow?: number;
    displayName?: string;
} | null;
export declare function buildModelsDevFallback(modelsDevSync: {
    getModelsForProvider(id: string): {
        id: string;
        name: string;
        contextWindow?: number;
        inputPricePerToken: number | null;
        outputPricePerToken: number | null;
        reasoning?: boolean;
        toolCall?: boolean;
        inputModalities?: DiscoveredModel['inputModalities'];
        outputModalities?: DiscoveredModel['outputModalities'];
    }[];
} | null, providerId: string, options?: {
    idPrefix?: string;
}): DiscoveredModel[];
export declare function buildFallbackModels(pricingSync: PricingLookup | null, providerId: string, confirmedModels?: ReadonlySet<string> | null): DiscoveredModel[];
export declare function buildSubscriptionFallbackModels(providerId: string): DiscoveredModel[];
export declare function reconcileCachedSubscriptionContextWindow(model: DiscoveredModel, providerId: string): DiscoveredModel;
export declare function supplementWithKnownModels(raw: DiscoveredModel[], providerId: string): DiscoveredModel[];
export {};
