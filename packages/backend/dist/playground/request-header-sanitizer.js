"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlockedHeaderName = isBlockedHeaderName;
exports.sanitizeRequestHeaders = sanitizeRequestHeaders;
const BLOCKED_EXACT = new Set([
    'authorization',
    'proxy-authorization',
    'cookie',
    'set-cookie',
    'host',
    'content-length',
    'content-type',
    'connection',
    'transfer-encoding',
    'upgrade',
    'te',
    'trailer',
]);
const BLOCKED_PREFIXES = ['x-manifest-'];
const MAX_HEADERS = 20;
const MAX_VALUE_LENGTH = 2_000;
function isBlockedHeaderName(name) {
    const lower = name.toLowerCase();
    if (BLOCKED_EXACT.has(lower))
        return true;
    return BLOCKED_PREFIXES.some((p) => lower.startsWith(p));
}
function sanitizeRequestHeaders(raw) {
    if (!raw)
        return undefined;
    const out = {};
    const seenLower = new Set();
    for (const [rawKey, rawValue] of Object.entries(raw)) {
        if (Object.keys(out).length >= MAX_HEADERS)
            break;
        if (typeof rawKey !== 'string' || typeof rawValue !== 'string')
            continue;
        const key = rawKey.trim();
        if (!key)
            continue;
        if (isBlockedHeaderName(key))
            continue;
        const lower = key.toLowerCase();
        if (seenLower.has(lower))
            continue;
        seenLower.add(lower);
        out[key] = rawValue.slice(0, MAX_VALUE_LENGTH);
    }
    return Object.keys(out).length > 0 ? out : undefined;
}
//# sourceMappingURL=request-header-sanitizer.js.map