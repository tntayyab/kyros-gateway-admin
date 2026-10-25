import { Repository } from 'typeorm';
import { ReasoningContentCacheEntry } from '../../entities/reasoning-content-cache-entry.entity';
import { type ReasoningModelCatalog } from './reasoning-format';
export declare const MAX_CACHE_ENTRIES = 10000;
export declare class ReasoningContentCache {
    private readonly repo?;
    readonly modelCatalog?: ReasoningModelCatalog | undefined;
    private readonly logger;
    private cache;
    private lastCleanup;
    constructor(repo?: Repository<ReasoningContentCacheEntry> | undefined, modelCatalog?: ReasoningModelCatalog | undefined);
    store(sessionKey: string, firstToolCallId: string, content: string): void;
    private storeByCacheKey;
    retrieve(sessionKey: string, firstToolCallId: string): string | null;
    retrieveMany(sessionKey: string, cacheKeys: string[]): Promise<Map<string, string>>;
    prepareRequest(body: Record<string, unknown>, sessionKey: string, endpointKey: string | null, model: string): Promise<Record<string, unknown>>;
    clearSession(sessionKey: string): void;
    private evictOverflow;
    private maybeCleanup;
    private persist;
    private deleteExpired;
    private cleanupSharedExpired;
}
