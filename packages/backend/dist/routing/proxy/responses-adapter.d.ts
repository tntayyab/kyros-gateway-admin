import { ResponsesToolNames } from './responses-tools';
type JsonRecord = Record<string, unknown>;
interface ChatCompletionToResponsesOptions {
    toolNames?: ResponsesToolNames;
    textFormat?: JsonRecord;
}
export declare function toChatCompletionsRequest(body: JsonRecord): JsonRecord;
export declare function toNativeResponsesRequest(body: JsonRecord, model: string, opts?: {
    defaultInstructions?: boolean;
    inputList?: boolean;
    forceStream?: boolean;
    stripCodexUnsupported?: boolean;
}): JsonRecord;
export declare function fromChatCompletionResponse(body: JsonRecord, model: string, options?: ChatCompletionToResponsesOptions): JsonRecord;
export declare function collectResponsesSseResponse(sseText: string): JsonRecord;
export interface ResponsesStreamTransformer {
    transform: (chunk: string) => string | null;
    finalize: () => string | null;
}
export interface ResponsesStreamTransformerOptions {
    toolNames?: ResponsesToolNames;
    textFormat?: JsonRecord;
}
export declare function createResponsesStreamTransformer(model: string, options?: ResponsesStreamTransformerOptions): ResponsesStreamTransformer;
export {};
