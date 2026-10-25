type JsonRecord = Record<string, unknown>;
export declare function messagesToChatCompletionsRequest(body: JsonRecord): JsonRecord;
export declare function chatCompletionsResponseToMessages(body: JsonRecord, model: string): JsonRecord;
export interface MessagesStreamTransformer {
    transform: (chunk: string) => string | null;
    finalize: () => string | null;
}
export declare function createMessagesStreamTransformer(model: string): MessagesStreamTransformer;
export {};
