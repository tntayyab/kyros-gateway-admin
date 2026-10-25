"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRequestHeaders = sanitizeRequestHeaders;
const MAX_HEADERS = 50;
const MAX_VALUE_BYTES = 1024;
const MAX_TOTAL_BYTES = 8192;
const ELLIPSIS_BYTES = Buffer.byteLength('…', 'utf8');
const SENSITIVE_HEADERS = new Set([
    'authorization',
    'cookie',
    'set-cookie',
    'proxy-authorization',
    'x-api-key',
]);
const NOISE_HEADERS = new Set([
    'x-railway-edge',
    'x-railway-request-id',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-port',
    'x-real-ip',
    'x-request-start',
    'x-envoy-external-address',
    'forwarded',
    'via',
    'x-cloud-trace-context',
    'traceparent',
    'host',
    'connection',
    'accept-encoding',
    'content-length',
]);
function sanitizeRequestHeaders(headers) {
    const out = {};
    let totalBytes = 2;
    let count = 0;
    for (const [rawKey, rawVal] of Object.entries(headers)) {
        if (count >= MAX_HEADERS)
            break;
        if (rawVal == null)
            continue;
        const key = rawKey.toLowerCase();
        if (SENSITIVE_HEADERS.has(key))
            continue;
        if (NOISE_HEADERS.has(key))
            continue;
        const joined = Array.isArray(rawVal) ? rawVal.join(', ') : String(rawVal);
        const cleaned = joined.replace(/[\x00-\x1f\x7f]/g, '').trim();
        if (!cleaned)
            continue;
        const value = truncateUtf8(cleaned, MAX_VALUE_BYTES);
        const entryBytes = Buffer.byteLength(JSON.stringify(key), 'utf8') +
            Buffer.byteLength(JSON.stringify(value), 'utf8') +
            1 +
            (count === 0 ? 0 : 1);
        if (totalBytes + entryBytes > MAX_TOTAL_BYTES)
            continue;
        out[key] = value;
        totalBytes += entryBytes;
        count++;
    }
    return count > 0 ? out : null;
}
function truncateUtf8(s, maxBytes) {
    const buf = Buffer.from(s, 'utf8');
    if (buf.length <= maxBytes)
        return s;
    const budget = Math.max(0, maxBytes - ELLIPSIS_BYTES);
    let sliced = buf.subarray(0, budget).toString('utf8');
    while (sliced.endsWith('\uFFFD'))
        sliced = sliced.slice(0, -1);
    return sliced + '…';
}
//# sourceMappingURL=request-headers.js.map