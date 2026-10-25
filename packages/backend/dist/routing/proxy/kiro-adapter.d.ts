import type { DiscoveredModel } from '../../model-discovery/model-fetcher';
export declare const KIRO_BASE_URL = "https://q.us-east-1.amazonaws.com";
export declare const KIRO_MODELS_TARGET = "AmazonCodeWhispererService.ListAvailableModels";
export declare const KIRO_CHAT_TARGET = "AmazonCodeWhispererStreamingService.GenerateAssistantResponse";
export declare function buildKiroHeaders(apiKey: string, target: string): Record<string, string>;
export declare function toKiroModelId(model: string): string;
export declare function parseKiroModels(body: unknown, provider?: string): DiscoveredModel[];
export interface KiroConversation {
    body: Record<string, unknown>;
    toolNameMap: Map<string, string>;
}
export declare function buildKiroChatRequest(body: Record<string, unknown>, model: string): Record<string, unknown>;
export interface KiroEvent {
    eventType?: string;
    messageType?: string;
    payload: unknown;
}
export declare class KiroEventStreamParser {
    private pending;
    push(chunk: Uint8Array): KiroEvent[];
    finish(): void;
}
export declare function estimateKiroPromptTokens(conversation: Record<string, unknown>): number;
export declare function createKiroOpenAiStream(source: ReadableStream<Uint8Array>, model: string, toolNameMap?: Map<string, string>, promptTokens?: number): ReadableStream<Uint8Array>;
export declare function forwardKiroChat(opts: {
    apiKey: string;
    model: string;
    body: Record<string, unknown>;
    stream: boolean;
    signal?: AbortSignal;
    timeoutMs: number;
    extraHeaders?: Record<string, string>;
}): Promise<Response>;
