import { toGoogleRequest, type GoogleStreamChunkResult, type GoogleStreamState } from './google-adapter';
import { applyAnthropicAutomaticCacheControl, applyAnthropicLastMessageCacheControl, applyAnthropicMessagesMutations, hasMessageCacheControl, extractThinkingBlocksFromMessagesResponse, toAnthropicRequest, type ThinkingBlocksCallback } from './anthropic-adapter';
import { toResponsesRequest, collectChatGptSseResponse } from './chatgpt-adapter';
import { type OpenAiReasoningStreamFormat } from './reasoning-format';
export declare function convertChatGptResponse(body: Record<string, unknown>, model: string): Record<string, unknown>;
export { createChatGptStreamTransformer } from './chatgpt-adapter';
export declare function convertGoogleResponse(googleBody: Record<string, unknown>, model: string): Record<string, unknown>;
export declare function convertGoogleStreamChunk(chunk: string, model: string, state?: GoogleStreamState): GoogleStreamChunkResult;
export declare function convertAnthropicResponse(anthropicBody: Record<string, unknown>, model: string): Record<string, unknown>;
export declare function convertAnthropicStreamChunk(chunk: string, model: string): string | null;
export declare function createAnthropicTransformer(model: string, onThinkingBlocks?: ThinkingBlocksCallback): (chunk: string) => string | null;
export { applyAnthropicAutomaticCacheControl, applyAnthropicLastMessageCacheControl, applyAnthropicMessagesMutations, hasMessageCacheControl, extractThinkingBlocksFromMessagesResponse, toGoogleRequest, toAnthropicRequest, toResponsesRequest, collectChatGptSseResponse, };
export type { GoogleStreamChunkResult } from './google-adapter';
export type { ThinkingBlocksCallback } from './anthropic-adapter';
export type { SignatureLookup, ThinkingBlockLookup } from './proxy-types';
export type ReasoningContentCallback = (firstToolCallId: string, content: string) => void;
export declare function createReasoningContentStreamTransformer(onReasoningContent?: ReasoningContentCallback, format?: OpenAiReasoningStreamFormat): (chunk: string) => string | null;
export interface SanitizeOpenAiBodyOptions {
    requireMaxCompletionTokens?: boolean;
    forwardReasoningEffort?: boolean;
}
export declare function sanitizeOpenAiBody(body: Record<string, unknown>, endpointKey: string, model: string, options?: SanitizeOpenAiBodyOptions): Record<string, unknown>;
