import { ThinkingBlockLookup } from './proxy-types';
import type { ThinkingBlock, ThinkingBlockRouteContext } from './thinking-block-cache';
export declare function hasMessageCacheControl(body: Record<string, unknown>): boolean;
export declare function applyAnthropicAutomaticCacheControl(body: Record<string, unknown>): void;
export declare function applyAnthropicLastMessageCacheControl(body: Record<string, unknown>): void;
export declare function closeAnthropicObjectSchemas(schema: unknown): unknown;
export interface AnthropicRequestOptions {
    injectSubscriptionIdentity?: boolean;
    thinkingLookup?: ThinkingBlockLookup;
    thinkingRouteContext?: ThinkingBlockRouteContext;
}
export declare function toAnthropicRequest(body: Record<string, unknown>, _model: string, options?: AnthropicRequestOptions): Record<string, unknown>;
export declare function extractThinkingBlocksFromMessagesResponse(body: Record<string, unknown>): ExtractedThinkingBlocks | undefined;
export declare function applyAnthropicMessagesMutations(body: Record<string, unknown>, options?: AnthropicRequestOptions): Record<string, unknown>;
export interface ExtractedThinkingBlocks {
    firstToolUseId: string;
    blocks: ThinkingBlock[];
}
export declare function fromAnthropicResponse(resp: Record<string, unknown>, model: string): Record<string, unknown> & {
    _extractedThinkingBlocks?: ExtractedThinkingBlocks;
};
export type ThinkingBlocksCallback = (firstToolUseId: string, blocks: ThinkingBlock[]) => void;
export declare function createAnthropicStreamTransformer(model: string, onThinkingBlocks?: ThinkingBlocksCallback): (chunk: string) => string | null;
export declare function transformAnthropicStreamChunk(chunk: string, model: string): string | null;
