type DownstreamFormat = 'chat-completions' | 'responses';
export interface ChatGptResponseQualifierOptions {
    downstreamFormat: DownstreamFormat;
    timeoutMs?: number;
    maxBufferSize?: number;
}
export declare const DEFAULT_CODEX_SEMANTIC_OUTPUT_TIMEOUT_MS = 60000;
export declare function parseCodexSemanticOutputTimeoutMs(rawValue?: string | undefined): number;
export declare function qualifyChatGptResponse(response: Response, options: ChatGptResponseQualifierOptions): Promise<Response>;
export {};
