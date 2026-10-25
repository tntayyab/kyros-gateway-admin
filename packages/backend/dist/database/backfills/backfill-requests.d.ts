export interface RequestBackfillTimeouts {
    lockTimeoutMs: number;
    statementTimeoutMs: number;
}
export interface RequestBackfillGateway {
    analyze(): Promise<void>;
    backfillFallbackGroups(batchSize: number, before: string, timeouts: RequestBackfillTimeouts, pause: () => Promise<void>, reportProgress?: (message: string) => void): Promise<{
        requests: number;
        attempts: number;
    }>;
    nextWindowEnd(afterId: string, batchSize: number, before: string): Promise<string | null>;
    backfillWindow(afterId: string, endId: string, before: string, timeouts: RequestBackfillTimeouts): Promise<{
        requests: number;
        attempts: number;
        rejections: number;
    }>;
    finalize(timeouts: RequestBackfillTimeouts): Promise<void>;
}
export interface RequestBackfillOptions {
    batchSize?: number;
    throttleMs?: number;
    lockTimeoutMs?: number;
    statementTimeoutMs?: number;
    maxRetries?: number;
    retryBackoffMs?: number;
    fallbackBefore?: string;
    before?: string;
    analyze?: boolean;
    finalize?: boolean;
    logger?: {
        log: (message: string) => void;
    };
    sleep?: (ms: number) => Promise<void>;
}
export interface RequestBackfillResult {
    windows: number;
    requests: number;
    attempts: number;
    rejections: number;
}
export declare function runRequestBackfill(gateway: RequestBackfillGateway, options?: RequestBackfillOptions): Promise<RequestBackfillResult>;
