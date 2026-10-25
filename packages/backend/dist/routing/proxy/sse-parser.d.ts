import { type EventSourceMessage } from 'eventsource-parser';
export declare const DEFAULT_MAX_SSE_BUFFER_SIZE = 1048576;
export declare const SSE_BUFFER_OVERFLOW_MESSAGE = "SSE buffer overflow: provider sent data without event boundaries";
export interface SsePayloadParser {
    feed(chunk: string): string[];
    flush(): string[];
}
export interface SsePayloadParserOptions {
    maxBufferSize?: number;
    onComment?: (comment: string) => void;
    onEvent?: (event: EventSourceMessage) => void;
}
export declare function createSsePayloadParser(options?: SsePayloadParserOptions): SsePayloadParser;
export declare function formatSseComment(comment: string): string;
