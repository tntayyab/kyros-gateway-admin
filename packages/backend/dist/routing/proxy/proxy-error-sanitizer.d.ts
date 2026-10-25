export type OpenAiCompatibleErrorType = 'invalid_request_error' | 'authentication_error' | 'permission_error' | 'rate_limit_error' | 'server_error';
export interface ClassifiedProviderError {
    message: string;
    type: OpenAiCompatibleErrorType;
    code: 'context_length_exceeded';
    source: 'provider';
}
export interface StructuredProviderError {
    message: string;
    type: string | null;
    param: string | null;
    code: string | null;
}
export declare function providerDetailMessage(detail: unknown): string | null;
export declare function parseStructuredProviderError(status: number, rawBody: string): StructuredProviderError | null;
export declare function openAiErrorTypeForStatus(status: number): OpenAiCompatibleErrorType;
export declare function classifyProviderError(status: number, rawBody: string): ClassifiedProviderError | null;
export declare function sanitizeProviderError(status: number, rawBody: string, nodeEnv?: string): string;
export declare function normalizeProviderErrorForStorage(status: number | null | undefined, rawBody: string): string;
