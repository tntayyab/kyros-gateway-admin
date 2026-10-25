"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MINIMAX_API_KEY_REGION_VALIDATION_MESSAGE = exports.DEFAULT_POLL_INTERVAL_MS = exports.DEFAULT_RESOURCE_URL = exports.DEFAULT_BASE_URL = exports.DEFAULT_REGION = exports.MINIMAX_BASE_URLS = exports.toAbsoluteExpiryTimestamp = exports.ABSOLUTE_TIME_THRESHOLD_MS = void 0;
exports.isMinimaxRegion = isMinimaxRegion;
exports.getMinimaxBaseUrl = getMinimaxBaseUrl;
exports.buildMinimaxCodeUrl = buildMinimaxCodeUrl;
exports.buildMinimaxTokenUrl = buildMinimaxTokenUrl;
exports.buildMinimaxResourceUrl = buildMinimaxResourceUrl;
exports.normalizeMinimaxVerificationUri = normalizeMinimaxVerificationUri;
exports.getMinimaxResourceUrl = getMinimaxResourceUrl;
exports.getMinimaxOauthBaseUrl = getMinimaxOauthBaseUrl;
exports.toPollIntervalMs = toPollIntervalMs;
exports.isOAuthTokenBlob = isOAuthTokenBlob;
const device_flow_1 = require("../core/device-flow");
const provider_base_url_1 = require("../../provider-base-url");
var device_flow_2 = require("../core/device-flow");
Object.defineProperty(exports, "ABSOLUTE_TIME_THRESHOLD_MS", { enumerable: true, get: function () { return device_flow_2.ABSOLUTE_TIME_THRESHOLD_MS; } });
Object.defineProperty(exports, "toAbsoluteExpiryTimestamp", { enumerable: true, get: function () { return device_flow_2.toAbsoluteExpiryTimestamp; } });
exports.MINIMAX_BASE_URLS = {
    global: 'https://api.minimax.io',
    cn: 'https://api.minimaxi.com',
};
exports.DEFAULT_REGION = 'global';
exports.DEFAULT_BASE_URL = exports.MINIMAX_BASE_URLS[exports.DEFAULT_REGION];
exports.DEFAULT_RESOURCE_URL = `${exports.DEFAULT_BASE_URL}/anthropic/v1`;
exports.DEFAULT_POLL_INTERVAL_MS = 2000;
exports.MINIMAX_API_KEY_REGION_VALIDATION_MESSAGE = 'MiniMax API-key region must be one of: global, cn';
function isMinimaxRegion(value) {
    return value === 'global' || value === 'cn';
}
function getMinimaxBaseUrl(region = exports.DEFAULT_REGION) {
    return exports.MINIMAX_BASE_URLS[region];
}
function buildMinimaxCodeUrl(baseUrl) {
    return `${baseUrl}/oauth/code`;
}
function buildMinimaxTokenUrl(baseUrl) {
    return `${baseUrl}/oauth/token`;
}
function buildMinimaxResourceUrl(baseUrl) {
    return `${baseUrl}/anthropic/v1`;
}
const VERIFICATION_HOST_REWRITES = {
    'www.minimax.io': 'platform.minimax.io',
    'www.minimaxi.com': 'platform.minimaxi.com',
};
function normalizeMinimaxVerificationUri(verificationUri) {
    let parsed;
    try {
        parsed = new URL(verificationUri);
    }
    catch {
        return verificationUri;
    }
    if (parsed.pathname !== '/oauth-authorize')
        return verificationUri;
    const replacement = VERIFICATION_HOST_REWRITES[parsed.hostname];
    if (!replacement)
        return verificationUri;
    parsed.hostname = replacement;
    return parsed.toString();
}
function getMinimaxResourceUrl(resourceUrl) {
    if (!resourceUrl)
        return null;
    return (0, provider_base_url_1.normalizeMinimaxSubscriptionBaseUrl)(resourceUrl);
}
function getMinimaxOauthBaseUrl(resourceUrl) {
    const normalized = getMinimaxResourceUrl(resourceUrl);
    if (!normalized)
        return exports.DEFAULT_BASE_URL;
    return new URL(normalized).origin;
}
function toPollIntervalMs(interval) {
    return (0, device_flow_1.toPollIntervalMs)(interval, exports.DEFAULT_POLL_INTERVAL_MS);
}
function isOAuthTokenBlob(value) {
    if (!value || typeof value !== 'object')
        return false;
    const blob = value;
    return (typeof blob.t === 'string' &&
        typeof blob.r === 'string' &&
        typeof blob.e === 'number' &&
        Number.isFinite(blob.e) &&
        (blob.u === undefined || typeof blob.u === 'string'));
}
//# sourceMappingURL=minimax-oauth-helpers.js.map