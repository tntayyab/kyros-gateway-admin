export interface ThinkingBlock {
    type: string;
    [key: string]: unknown;
}
export interface ThinkingBlockRouteContext {
    provider: string;
    authType?: string | null;
    model: string;
}
export declare const MAX_CACHE_ENTRIES = 10000;
export declare class ThinkingBlockCache {
    private cache;
    private lastCleanup;
    store(sessionKey: string, firstToolUseId: string, blocks: ThinkingBlock[], routeContext?: ThinkingBlockRouteContext): void;
    private evictOverflow;
    retrieve(sessionKey: string, firstToolUseId: string, routeContext?: ThinkingBlockRouteContext): ThinkingBlock[] | null;
    clearSession(sessionKey: string): void;
    private maybeCleanup;
}
