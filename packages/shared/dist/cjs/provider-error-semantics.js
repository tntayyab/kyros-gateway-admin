"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnthropicExtraUsageError = isAnthropicExtraUsageError;
const ANTHROPIC_EXTRA_USAGE_MESSAGE = /\byou(?: are|['’]re) out of extra usage\b/i;
/**
 * Anthropic reports exhausted Claude subscription extra usage as a 400
 * `invalid_request_error`, even though the failure is billing-related and cannot
 * be repaired by changing the request body.
 */
function isAnthropicExtraUsageError(signals) {
    if (signals.httpStatus !== 400 || signals.provider?.trim().toLowerCase() !== 'anthropic') {
        return false;
    }
    if (!signals.errorBody)
        return false;
    try {
        const parsed = JSON.parse(signals.errorBody);
        if (!parsed || typeof parsed !== 'object')
            return false;
        const body = parsed;
        const error = body.error && typeof body.error === 'object' ? body.error : body;
        return (error.type === 'invalid_request_error' &&
            typeof error.message === 'string' &&
            ANTHROPIC_EXTRA_USAGE_MESSAGE.test(error.message));
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=provider-error-semantics.js.map