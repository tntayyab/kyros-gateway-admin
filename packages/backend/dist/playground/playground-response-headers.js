"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whitelistResponseHeaders = whitelistResponseHeaders;
const ALLOWED_EXACT = new Set([
    'content-type',
    'date',
    'x-request-id',
    'request-id',
    'openai-model',
    'openai-organization',
    'openai-processing-ms',
    'openai-version',
    'anthropic-ratelimit-requests-limit',
    'anthropic-ratelimit-requests-remaining',
    'anthropic-ratelimit-requests-reset',
    'anthropic-ratelimit-tokens-limit',
    'anthropic-ratelimit-tokens-remaining',
    'anthropic-ratelimit-tokens-reset',
]);
const ALLOWED_PREFIXES = ['x-ratelimit-', 'x-manifest-', 'ratelimit-'];
function whitelistResponseHeaders(raw) {
    const out = {};
    raw.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (ALLOWED_EXACT.has(lower) || ALLOWED_PREFIXES.some((p) => lower.startsWith(p))) {
            out[lower] = value;
        }
    });
    return out;
}
//# sourceMappingURL=playground-response-headers.js.map