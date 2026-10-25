import { OnModuleInit } from '@nestjs/common';
export interface OpencodeGoCatalogEntry {
    id: string;
    displayName: string;
    format: 'openai' | 'anthropic' | 'responses';
    costPerRequestUsd: number | null;
}
export declare const OPENCODE_GO_BUDGET_5H_USD = 12;
export declare class OpencodeGoCatalogService implements OnModuleInit {
    private readonly logger;
    private cache;
    private lastGood;
    private costByModelId;
    private formatByModelId;
    private inflight;
    onModuleInit(): void;
    list(): Promise<OpencodeGoCatalogEntry[]>;
    refresh(): Promise<OpencodeGoCatalogEntry[]>;
    private startFetch;
    private fetchAndCache;
    getCostPerRequest(modelId: string | null | undefined): number | null;
    getFormat(modelId: string | null | undefined): OpencodeGoCatalogEntry['format'] | null;
    resolveCostPerRequest(modelId: string | null | undefined): Promise<number | null>;
    resolveFormat(modelId: string | null | undefined): Promise<OpencodeGoCatalogEntry['format'] | null>;
    private cacheFallback;
    parse(mdx: string): OpencodeGoCatalogEntry[];
    private parseLimits;
    private rebuildIndexes;
    resetCache(): void;
}
