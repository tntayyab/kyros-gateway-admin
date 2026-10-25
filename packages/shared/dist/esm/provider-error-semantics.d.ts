export interface ProviderErrorSignals {
    provider?: string | null;
    httpStatus?: number | null;
    errorBody?: string | null;
}
/**
 * Anthropic reports exhausted Claude subscription extra usage as a 400
 * `invalid_request_error`, even though the failure is billing-related and cannot
 * be repaired by changing the request body.
 */
export declare function isAnthropicExtraUsageError(signals: ProviderErrorSignals): boolean;
//# sourceMappingURL=provider-error-semantics.d.ts.map