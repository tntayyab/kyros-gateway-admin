import type { AuthType, ModelCapability, ModelModality } from 'manifest-shared';
export declare const DEFAULT_CONTEXT_WINDOW = 128000;
export interface LongContextPricing {
    thresholdTokens: number;
    inputPricePerToken: number;
    outputPricePerToken: number;
    cacheReadPricePerToken?: number;
    cacheWritePricePerToken?: number;
}
export interface DiscoveredModel {
    id: string;
    displayName: string;
    provider: string;
    contextWindow: number;
    contextWindowSource?: 'provider' | 'subscription_config';
    inputPricePerToken: number | null;
    outputPricePerToken: number | null;
    cacheReadPricePerToken?: number;
    cacheWritePricePerToken?: number;
    longContextPricing?: LongContextPricing;
    capabilityReasoning: boolean;
    capabilityCode: boolean;
    capabilities?: readonly ModelCapability[];
    inputModalities?: readonly ModelModality[];
    outputModalities?: readonly ModelModality[];
    supportedEndpoints?: readonly string[];
    qualityScore: number;
    authType?: AuthType;
    providerName?: string;
    providerAlias?: string;
}
export interface FetcherConfig {
    endpoint: string | ((key: string) => string);
    buildHeaders: (key: string, authType?: string) => Record<string, string>;
    parse: (body: unknown, provider: string) => DiscoveredModel[];
}
