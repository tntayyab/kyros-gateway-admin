import { DiscoveredModel, FetcherConfig } from './model-fetcher';
import { OpencodeGoCatalogService } from './opencode-go-catalog.service';
export declare const UNIVERSAL_NON_CHAT_RE: RegExp;
export declare const PROVIDER_NON_CHAT: Record<string, RegExp>;
export declare const PROVIDER_BLOCKLIST: Record<string, ReadonlySet<string>>;
export declare function filterNonChatModels(models: DiscoveredModel[], configKey: string): DiscoveredModel[];
export declare const PROVIDER_CONFIGS: Record<string, FetcherConfig>;
export interface ProviderModelFetchOptions {
    forceRefresh?: boolean;
    previousModels?: readonly DiscoveredModel[];
}
export declare class ProviderModelFetcherService {
    private readonly opencodeGoCatalog;
    private readonly logger;
    constructor(opencodeGoCatalog?: OpencodeGoCatalogService | null);
    fetch(providerId: string, apiKey: string, authType?: string, endpointOverride?: string, options?: ProviderModelFetchOptions): Promise<DiscoveredModel[]>;
    private fetchModelList;
    private fetchBedrockCrisProfiles;
    private fetchFireworksModels;
    private buildFireworksModelsUrl;
    private fetchPioneerModels;
    private fetchPioneerBaseCatalog;
    private fetchOpencodeGoModels;
    private fetchOpencodeGoLiveModels;
    private fetchOpencodeGoDocsCatalog;
    private fetchKiroModels;
    private fetchClinePassKnownModels;
}
