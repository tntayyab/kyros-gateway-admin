"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_TIMEOUT_STATUS = exports.PROVIDER_TRANSPORT_ERROR_STATUS = void 0;
exports.getErrorName = getErrorName;
exports.getErrorMessage = getErrorMessage;
exports.getErrorCode = getErrorCode;
exports.getErrorCause = getErrorCause;
exports.isTransportError = isTransportError;
exports.isTimeoutError = isTimeoutError;
exports.sanitizeTransportErrorDetail = sanitizeTransportErrorDetail;
exports.selectTransportErrorDetail = selectTransportErrorDetail;
exports.describeTransportError = describeTransportError;
exports.buildTransportErrorResponse = buildTransportErrorResponse;
exports.PROVIDER_TRANSPORT_ERROR_STATUS = 503;
exports.PROVIDER_TIMEOUT_STATUS = 504;
const GENERIC_FETCH_ERROR_MESSAGE = 'fetch failed';
const TRANSPORT_PATTERN = /(fetch failed|failed to parse url|network|timeout|econnrefused|econnreset|enotfound|ehostunreach|etimedout|und_err_|\bterminated\b)/i;
function getErrorName(error) {
    if (!(error instanceof Error))
        return undefined;
    return error.name;
}
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (!error || typeof error !== 'object')
        return undefined;
    const message = error.message;
    return typeof message === 'string' ? message : undefined;
}
function getErrorCode(error) {
    if (!error || typeof error !== 'object')
        return undefined;
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
}
function getErrorCause(error) {
    if (!(error instanceof Error))
        return undefined;
    return error.cause;
}
function isTransportError(error) {
    const name = getErrorName(error);
    if (name === 'AbortError' || name === 'TimeoutError')
        return true;
    const detail = [
        getErrorMessage(error),
        getErrorMessage(getErrorCause(error)),
        getErrorCode(error),
        getErrorCode(getErrorCause(error)),
    ]
        .filter((value) => Boolean(value))
        .join(' ');
    return TRANSPORT_PATTERN.test(detail);
}
function isTimeoutError(error) {
    return getErrorName(error) === 'TimeoutError';
}
function sanitizeTransportErrorDetail(detail) {
    return detail.replace(/key=[^&\s]+/gi, 'key=***').slice(0, 500);
}
function selectTransportErrorDetail(error) {
    const message = getErrorMessage(error);
    const code = getErrorCode(error);
    if (message && message.toLowerCase() !== GENERIC_FETCH_ERROR_MESSAGE) {
        return sanitizeTransportErrorDetail(message);
    }
    if (code)
        return code;
    return undefined;
}
function describeTransportError(error) {
    if (isTimeoutError(error)) {
        return 'Upstream provider request timed out';
    }
    const detail = selectTransportErrorDetail(error) ?? selectTransportErrorDetail(getErrorCause(error));
    if (!detail)
        return 'Failed to reach upstream provider';
    return `Failed to reach upstream provider: ${detail}`;
}
function buildTransportErrorResponse(error) {
    const status = isTimeoutError(error) ? exports.PROVIDER_TIMEOUT_STATUS : exports.PROVIDER_TRANSPORT_ERROR_STATUS;
    const message = describeTransportError(error);
    return new Response(JSON.stringify({ error: { message } }), {
        status,
        statusText: status === exports.PROVIDER_TIMEOUT_STATUS ? 'Gateway Timeout' : 'Service Unavailable',
        headers: { 'content-type': 'application/json' },
    });
}
//# sourceMappingURL=proxy-transport.js.map