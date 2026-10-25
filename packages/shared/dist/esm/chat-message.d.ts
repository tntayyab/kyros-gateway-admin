export type Role = 'system' | 'user' | 'assistant' | 'tool' | 'unknown';
export interface ToolCall {
    id?: string;
    type?: string;
    function?: {
        name?: string;
        arguments?: unknown;
    };
}
export interface ChatMessage {
    role?: string;
    content?: unknown;
    name?: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
}
export interface ChatTool {
    type?: string;
    function?: {
        name?: string;
        description?: string;
        parameters?: unknown;
    };
}
export interface RecordedResponseBody {
    type?: 'json' | 'stream';
    body?: unknown;
    raw_sse?: string;
}
export declare function normalizeRole(role: unknown): Role;
export declare function coerceContentToText(content: unknown): string;
export declare function extractRequestMessages(requestBody: Record<string, unknown> | null | undefined): ChatMessage[];
export declare function extractRequestTools(requestBody: Record<string, unknown> | null | undefined): ChatTool[];
export declare function extractResponseMessages(responseBody: RecordedResponseBody | null | undefined): ChatMessage[];
export declare function extractResponseToolCalls(responseBody: RecordedResponseBody | null | undefined): ToolCall[];
export declare function extractRecordedConversationMessages(requestBody: Record<string, unknown> | null | undefined, responseBody: RecordedResponseBody | null | undefined): ChatMessage[];
//# sourceMappingURL=chat-message.d.ts.map