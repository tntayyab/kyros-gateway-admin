export interface ProviderEndpoint {
    baseUrl: string;
    buildHeaders: (apiKey: string, authType?: string) => Record<string, string>;
    buildPath: (model: string) => string;
    buildStreamPath?: (model: string) => string;
    format: 'openai' | 'google' | 'anthropic' | 'chatgpt' | 'kiro';
    streamUsageReporting?: 'openai_stream_options';
    requiresSsrfRevalidation?: boolean;
    codeAssistEnvelope?: boolean;
    skipSubscriptionIdentity?: boolean;
    forwardResponsesStream?: boolean;
    acceptsMaxOutputTokens?: boolean;
    acceptsPromptCacheKey?: boolean;
}
export declare function resolveBedrockEndpointKey(model: string, apiMode?: string): 'bedrock' | 'bedrock-responses' | 'bedrock-anthropic' | 'bedrock-runtime' | 'bedrock-runtime-responses' | 'bedrock-runtime-anthropic';
export declare const PROVIDER_ENDPOINTS: Record<string, ProviderEndpoint>;
export declare function buildCustomEndpoint(baseUrl: string, apiKind?: 'openai' | 'anthropic'): ProviderEndpoint;
export declare function buildEndpointOverride(baseUrl: string, templateKey: string): ProviderEndpoint;
export declare function resolveEndpointKey(provider: string): string | null;
