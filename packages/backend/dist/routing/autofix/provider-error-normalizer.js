"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeProviderError = normalizeProviderError;
exports.serializeProviderError = serializeProviderError;
const secret_scrub_1 = require("../../common/utils/secret-scrub");
const proxy_error_sanitizer_1 = require("../proxy/proxy-error-sanitizer");
const MAX_MESSAGE_LENGTH = 2000;
function coerceString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}
function coerceScrubbed(value) {
    const raw = coerceString(value);
    return raw === null ? null : (0, secret_scrub_1.scrubSecrets)(raw);
}
function normalizeProviderError(rawBody) {
    let parsed = null;
    try {
        const json = JSON.parse(rawBody);
        if (json && typeof json === 'object')
            parsed = json;
    }
    catch {
        parsed = null;
    }
    const errorObj = parsed && typeof parsed.error === 'object' && parsed.error !== null
        ? parsed.error
        : parsed;
    const rawMessage = coerceString(errorObj?.message) ??
        coerceString(parsed?.message) ??
        coerceString(parsed?.error) ??
        (0, proxy_error_sanitizer_1.providerDetailMessage)(parsed?.detail) ??
        rawBody;
    const message = (0, secret_scrub_1.scrubSecrets)(rawMessage).slice(0, MAX_MESSAGE_LENGTH);
    return {
        message,
        type: coerceScrubbed(errorObj?.type),
        param: coerceScrubbed(errorObj?.param),
        code: coerceScrubbed(errorObj?.code),
    };
}
const MAX_FIELD_LENGTH = 1024;
function bare(message) {
    return { message, type: null, param: null, code: null };
}
function envelopeOf(error, message) {
    return JSON.stringify({
        error: {
            message,
            ...(error.type ? { type: error.type } : {}),
            ...(error.param ? { param: error.param } : {}),
            ...(error.code ? { code: error.code } : {}),
        },
    });
}
function serializeProviderError(error) {
    const clip = (v) => v ? (0, secret_scrub_1.scrubSecrets)(v).slice(0, MAX_FIELD_LENGTH) : null;
    const safe = {
        message: (0, secret_scrub_1.scrubSecrets)(error.message),
        type: clip(error.type),
        param: clip(error.param),
        code: clip(error.code),
    };
    const target = envelopeOf(safe, '').length <= MAX_MESSAGE_LENGTH ? safe : bare(safe.message);
    let message = target.message;
    let out = envelopeOf(target, message);
    while (out.length > MAX_MESSAGE_LENGTH && message.length > 0) {
        message = dropTail(message, Math.max(out.length - MAX_MESSAGE_LENGTH, 1));
        out = envelopeOf(target, message);
    }
    return out;
}
function dropTail(s, count) {
    const cut = s.slice(0, Math.max(0, s.length - count));
    const last = cut.charCodeAt(cut.length - 1);
    return last >= 0xd800 && last <= 0xdbff ? cut.slice(0, -1) : cut;
}
//# sourceMappingURL=provider-error-normalizer.js.map