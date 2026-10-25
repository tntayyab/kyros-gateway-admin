export declare const DEFAULT_BACKFILL_OPTIONS: {
    readonly batchSize: 10000;
    readonly throttleMs: 50;
    readonly lockTimeoutMs: 5000;
    readonly statementTimeoutMs: 60000;
    readonly maxRetries: 5;
    readonly retryBackoffMs: 1000;
};
export declare function isRetryableBackfillError(error: unknown): boolean;
export interface BackfillTimeouts {
    lockTimeoutMs: number;
    statementTimeoutMs: number;
}
export interface BackfillOptions {
    batchSize?: number;
    throttleMs?: number;
    lockTimeoutMs?: number;
    statementTimeoutMs?: number;
    maxRetries?: number;
    retryBackoffMs?: number;
    logger?: {
        log: (message: string) => void;
    };
    sleep?: (ms: number) => Promise<void>;
}
export interface BackfillResult {
    windows: number;
    stamped: number;
}
export interface BackfillGateway {
    analyze(): Promise<void>;
    nextWindowEnd(afterId: string, batchSize: number): Promise<string | null>;
    stampWindow(afterId: string, endId: string, timeouts: BackfillTimeouts): Promise<number>;
}
export declare function runMessageProviderBackfill(gateway: BackfillGateway, options?: BackfillOptions): Promise<BackfillResult>;
