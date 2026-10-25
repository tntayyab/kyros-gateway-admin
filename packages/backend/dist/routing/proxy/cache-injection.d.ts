type OpenRouterCacheMode = 'anthropic' | 'message';
export declare function injectOpenRouterCacheControl(body: Record<string, unknown>, mode?: OpenRouterCacheMode): void;
export declare function injectOpenAiMessageCacheControl(body: Record<string, unknown>): void;
export {};
