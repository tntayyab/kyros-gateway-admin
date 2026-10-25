import type { EventSourceMessage } from 'eventsource-parser';
import type { ProviderWireFormat } from './proxy-types';
export type StreamFailureReason = 'upstream_error' | 'stream_interrupted' | 'stream_idle_timeout' | 'incomplete_stream';
export declare class StreamFailure extends Error {
    readonly reason: StreamFailureReason;
    readonly status: number;
    constructor(reason: StreamFailureReason, status: number, message: string, options?: ErrorOptions);
}
export declare const STREAM_IDLE_TIMEOUT_MESSAGE = "Upstream provider stream timed out while waiting for the next event.";
export declare const STREAM_INTERRUPTED_MESSAGE = "Upstream provider stream was interrupted.";
export declare const INCOMPLETE_STREAM_MESSAGE = "Upstream provider stream ended before its completion event.";
export declare class UpstreamStreamError extends StreamFailure {
    constructor(cause: unknown);
}
export declare class StreamIdleTimeoutError extends StreamFailure {
    constructor();
}
export declare class StreamProtocolObserver {
    private readonly protocol;
    private completed;
    constructor(protocol: ProviderWireFormat);
    observe(event: EventSourceMessage): void;
    isComplete(): boolean;
    assertComplete(): void;
}
