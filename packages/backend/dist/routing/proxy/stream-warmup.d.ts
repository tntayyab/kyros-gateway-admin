export declare const DEFAULT_STREAM_WARMUP_MS = 15000;
export declare function parseStreamWarmupMs(rawValue?: string | undefined): number;
export declare const STREAM_WARMUP_MS: number;
export interface WarmupSuccess {
    ok: true;
    stream: ReadableStream<Uint8Array>;
}
export interface WarmupFailure {
    ok: false;
    reason: 'timeout' | 'error' | 'empty';
    message: string;
}
export type WarmupResult = WarmupSuccess | WarmupFailure;
export declare function peekStream(source: ReadableStream<Uint8Array>, timeoutMs?: number): Promise<WarmupResult>;
