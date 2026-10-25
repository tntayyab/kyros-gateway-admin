"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIVOT_CLAIM_CLOUD_ORIGIN = exports.PIVOT_CLAIM_PATH = exports.CORS_PREFLIGHT_MAX_AGE_SECONDS = exports.HOSTED_WINGMAN_ORIGIN = void 0;
exports.buildDevAllowedOrigins = buildDevAllowedOrigins;
exports.buildProdAllowedOrigins = buildProdAllowedOrigins;
exports.buildFrameSrc = buildFrameSrc;
exports.parseFrameAncestors = parseFrameAncestors;
exports.createCorsOriginHandler = createCorsOriginHandler;
exports.buildCorsOptions = buildCorsOptions;
exports.applyPrivateNetworkAllow = applyPrivateNetworkAllow;
exports.applyPivotClaimCors = applyPivotClaimCors;
exports.HOSTED_WINGMAN_ORIGIN = 'https://wingman.manifest.build';
function buildDevAllowedOrigins({ configuredOrigin, wingmanPort, }) {
    return Array.from(new Set([
        configuredOrigin,
        `http://localhost:${wingmanPort}`,
        `http://127.0.0.1:${wingmanPort}`,
        'http://localhost:3002',
        exports.HOSTED_WINGMAN_ORIGIN,
    ]));
}
function buildProdAllowedOrigins({ extraOrigins } = {}) {
    const extras = (extraOrigins ?? '')
        .split(',')
        .map((v) => v.trim().replace(/\/+$/, ''))
        .filter((v) => v.length > 0);
    return Array.from(new Set([exports.HOSTED_WINGMAN_ORIGIN, ...extras]));
}
function buildFrameSrc({ isDev, wingmanPort }) {
    if (!isDev) {
        return ["'self'"];
    }
    return [
        "'self'",
        `http://localhost:${wingmanPort}`,
        `http://127.0.0.1:${wingmanPort}`,
        exports.HOSTED_WINGMAN_ORIGIN,
    ];
}
const FRAME_ANCESTOR_ORIGIN_RE = /^https?:\/\/(\*\.)?[a-zA-Z0-9.-]+(:\d+)?$/;
function parseFrameAncestors(raw) {
    if (!raw)
        return ["'none'"];
    const valid = raw
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v === "'self'" || v === "'none'" || FRAME_ANCESTOR_ORIGIN_RE.test(v));
    return valid.length > 0 ? valid : ["'none'"];
}
function createCorsOriginHandler(allowedOrigins) {
    return (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(null, false);
    };
}
exports.CORS_PREFLIGHT_MAX_AGE_SECONDS = 7200;
function buildCorsOptions(allowedOrigins) {
    return {
        origin: createCorsOriginHandler(allowedOrigins),
        credentials: false,
        maxAge: exports.CORS_PREFLIGHT_MAX_AGE_SECONDS,
    };
}
function applyPrivateNetworkAllow(req, allowedOrigins, setHeader) {
    if (req.method !== 'OPTIONS')
        return;
    const pnaHeader = req.headers['access-control-request-private-network'];
    if (pnaHeader !== 'true')
        return;
    const origin = req.headers.origin;
    if (typeof origin !== 'string' || !allowedOrigins.includes(origin))
        return;
    setHeader('Access-Control-Allow-Private-Network', 'true');
}
exports.PIVOT_CLAIM_PATH = '/api/v1/waitlist/pivot/claim';
function applyPivotClaimCors(req, setHeader) {
    if (req.path !== exports.PIVOT_CLAIM_PATH)
        return false;
    setHeader('Access-Control-Allow-Origin', '*');
    setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    setHeader('Access-Control-Allow-Headers', 'Content-Type');
    setHeader('Access-Control-Max-Age', '600');
    return req.method === 'OPTIONS';
}
exports.PIVOT_CLAIM_CLOUD_ORIGIN = 'https://app.manifest.build';
//# sourceMappingURL=cors-csp-config.js.map