import { Response as ExpressResponse } from 'express';
import type { ProviderWireFormat } from './proxy-types';
export { StreamFailure, StreamIdleTimeoutError, UpstreamStreamError, STREAM_IDLE_TIMEOUT_MESSAGE, STREAM_INTERRUPTED_MESSAGE, INCOMPLETE_STREAM_MESSAGE, } from './stream-protocol';
export interface StreamUsage {
    prompt_tokens: number;
    completion_tokens: number;
    cache_read_tokens?: number;
    cache_creation_tokens?: number;
    reported_cost_usd?: number;
}
export declare const DEFAULT_STREAM_IDLE_TIMEOUT_MS = 180000;
export declare function parseStreamIdleTimeoutMs(rawValue?: string | undefined): number;
export interface StreamRelayOptions {
    idleTimeoutMs?: number;
    protocol?: ProviderWireFormat;
    onUpstreamChunk?: (text: string) => void;
}
export declare function parseUsageObject(usage: unknown): StreamUsage | null;
export declare function extractUsageFromSse(sseText: string): StreamUsage | null;
export declare function initSseHeaders(res: ExpressResponse, extraHeaders?: Record<string, string>, statusCode?: number): void;
export declare function pipePassthrough(source: ReadableStream<Uint8Array>, dest: ExpressResponse, tap: (parsedEvent: string) => string | null, onClientChunk?: (text: string) => void, options?: StreamRelayOptions): Promise<StreamUsage | null>;
export declare function pipeStream(source: ReadableStream<Uint8Array>, dest: ExpressResponse, transform?: (chunk: string) => string | null, finalize?: () => string | null, onClientChunk?: (text: string) => void, options?: StreamRelayOptions): Promise<StreamUsage | null>;
