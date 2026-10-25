"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_CLIENT_BETA_BYTES = exports.MAX_CLIENT_BETA_FLAGS = void 0;
exports.parseClientBetas = parseClientBetas;
exports.mergeAnthropicBeta = mergeAnthropicBeta;
exports.isAnthropicHost = isAnthropicHost;
const BETA_FLAG_RE = /^[a-z0-9][a-z0-9.-]*$/;
exports.MAX_CLIENT_BETA_FLAGS = 20;
exports.MAX_CLIENT_BETA_BYTES = 1024;
function parseClientBetas(header) {
    const raw = Array.isArray(header) ? header.join(',') : header;
    if (typeof raw !== 'string')
        return [];
    const kept = [];
    let bytes = 0;
    for (const segment of raw.split(',')) {
        const flag = segment.trim();
        if (!BETA_FLAG_RE.test(flag) || kept.includes(flag))
            continue;
        const grown = bytes + flag.length + (kept.length > 0 ? 1 : 0);
        if (grown > exports.MAX_CLIENT_BETA_BYTES)
            break;
        kept.push(flag);
        bytes = grown;
        if (kept.length === exports.MAX_CLIENT_BETA_FLAGS)
            break;
    }
    return kept;
}
function mergeAnthropicBeta(manifestHeader, clientHeader) {
    const clientFlags = parseClientBetas(clientHeader);
    if (clientFlags.length === 0)
        return manifestHeader;
    const merged = manifestHeader
        ? manifestHeader
            .split(',')
            .map((flag) => flag.trim())
            .filter(Boolean)
        : [];
    for (const flag of clientFlags) {
        if (!merged.includes(flag))
            merged.push(flag);
    }
    return merged.join(',');
}
const ANTHROPIC_HOST = 'api.anthropic.com';
function isAnthropicHost(baseUrl) {
    try {
        return new URL(baseUrl).hostname === ANTHROPIC_HOST;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=anthropic-beta.js.map