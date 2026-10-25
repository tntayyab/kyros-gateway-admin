export declare const MAX_CACHE_ENTRIES = 10000;
export declare class ThoughtSignatureCache {
    private cache;
    private lastCleanup;
    store(sessionKey: string, toolCallId: string, signature: string): void;
    private evictOverflow;
    retrieve(sessionKey: string, toolCallId: string): string | null;
    clearSession(sessionKey: string): void;
    private maybeCleanup;
}
