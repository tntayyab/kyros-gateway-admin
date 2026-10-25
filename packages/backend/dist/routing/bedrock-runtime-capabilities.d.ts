export type BedrockRuntimeApi = 'chat_completions' | 'responses';
export interface BedrockRuntimeCapabilities {
    modelId: string;
    apis: readonly BedrockRuntimeApi[];
    chatTokenParameter: 'max_tokens' | 'max_completion_tokens';
    sourceUrl: string;
    verifiedAt: string;
}
export declare const BEDROCK_RUNTIME_CAPABILITY_CATALOG: readonly BedrockRuntimeCapabilities[];
export declare const BEDROCK_RUNTIME_CLAUDE_MESSAGES_MODELS: readonly {
    modelId: string;
    verifiedAt: string;
}[];
export declare function getBedrockRuntimeCapabilities(model: string): BedrockRuntimeCapabilities | null;
export declare function isBedrockRuntimeClaudeProfile(model: string): boolean;
export declare function getBedrockRuntimeSupportedEndpoints(model: string): string[];
