"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOAuthTokenBlob = isOAuthTokenBlob;
exports.parseOAuthTokenBlob = parseOAuthTokenBlob;
exports.serializeOAuthTokenBlob = serializeOAuthTokenBlob;
function isOAuthTokenBlob(value) {
    if (!value || typeof value !== 'object')
        return false;
    const v = value;
    return (typeof v.t === 'string' &&
        typeof v.r === 'string' &&
        typeof v.e === 'number' &&
        (v.u === undefined || typeof v.u === 'string'));
}
function parseOAuthTokenBlob(rawValue) {
    try {
        const parsed = JSON.parse(rawValue);
        if (!isOAuthTokenBlob(parsed))
            return null;
        return parsed.u !== undefined
            ? { t: parsed.t, r: parsed.r, e: parsed.e, u: parsed.u }
            : { t: parsed.t, r: parsed.r, e: parsed.e };
    }
    catch {
        return null;
    }
}
function serializeOAuthTokenBlob(blob) {
    return JSON.stringify(blob);
}
//# sourceMappingURL=oauth-blob.js.map