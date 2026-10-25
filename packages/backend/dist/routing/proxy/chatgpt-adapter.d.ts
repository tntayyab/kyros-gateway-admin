export declare class ResponsesSseError extends Error {
    readonly status: number;
    readonly body: string;
    constructor(message: string, status: number, body: string);
}
export interface ToResponsesRequestOptions {
    mapMaxOutputTokens?: boolean;
    forwardPromptCacheKey?: boolean;
    stream?: boolean;
    mapReasoningEffort?: boolean;
}
export declare function toResponsesRequest(body: Record<string, unknown>, model: string, options?: ToResponsesRequestOptions): Record<string, unknown>;
interface ReasoningStreamState {
    streamed: boolean;
    sawToolCall: boolean;
}
export declare function fromResponsesResponse(data: Record<string, unknown>, model: string): Record<string, unknown>;
export declare function createChatGptStreamTransformer(model: string): (chunk: string) => string | null;
export declare function transformResponsesStreamChunk(chunk: string, model: string, state?: ReasoningStreamState): string | null;
export declare function collectChatGptSseResponse(sseText: string, model: string): Record<string, unknown>;
export declare function buildResponsesSseError(data: Record<string, unknown>): ResponsesSseError;
export {};
