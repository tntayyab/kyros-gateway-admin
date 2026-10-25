import type { Cache } from 'cache-manager';
export declare class AgentListCacheService {
    private readonly cache;
    private readonly logger;
    private readonly generations;
    private nextGeneration;
    constructor(cache: Cache);
    key(tenantId: string, includePlayground: boolean): string;
    invalidate(tenantId: string): Promise<void>;
}
