"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAbsoluteExpiryTimestamp = exports.KiroAuthorizationOptionsError = exports.KIRO_DEFAULT_POLL_INTERVAL_MS = exports.KIRO_REGISTER_GRANT_TYPES = exports.KIRO_DEFAULT_SCOPES = exports.KIRO_REFRESH_GRANT = exports.KIRO_DEVICE_CODE_GRANT = exports.KIRO_CLIENT_TYPE = exports.KIRO_CLIENT_NAME = exports.KIRO_DEFAULT_START_URL = exports.KIRO_OIDC_DEFAULT_REGION = void 0;
exports.getKiroOidcBaseUrl = getKiroOidcBaseUrl;
exports.buildKiroRegisterUrl = buildKiroRegisterUrl;
exports.buildKiroDeviceAuthorizationUrl = buildKiroDeviceAuthorizationUrl;
exports.buildKiroTokenUrl = buildKiroTokenUrl;
exports.normalizeKiroRegion = normalizeKiroRegion;
exports.normalizeKiroStartUrl = normalizeKiroStartUrl;
exports.toPollIntervalMs = toPollIntervalMs;
exports.isKiroOAuthTokenBlob = isKiroOAuthTokenBlob;
exports.parseKiroOAuthTokenBlob = parseKiroOAuthTokenBlob;
exports.serializeKiroOAuthTokenBlob = serializeKiroOAuthTokenBlob;
const device_flow_1 = require("../core/device-flow");
exports.KIRO_OIDC_DEFAULT_REGION = 'us-east-1';
exports.KIRO_DEFAULT_START_URL = 'https://view.awsapps.com/start';
exports.KIRO_CLIENT_NAME = 'Manifest';
exports.KIRO_CLIENT_TYPE = 'public';
exports.KIRO_DEVICE_CODE_GRANT = 'urn:ietf:params:oauth:grant-type:device_code';
exports.KIRO_REFRESH_GRANT = 'refresh_token';
exports.KIRO_DEFAULT_SCOPES = Object.freeze([
    'codewhisperer:completions',
    'codewhisperer:analysis',
    'codewhisperer:conversations',
    'codewhisperer:taskassist',
    'codewhisperer:transformations',
]);
exports.KIRO_REGISTER_GRANT_TYPES = Object.freeze([
    exports.KIRO_DEVICE_CODE_GRANT,
    exports.KIRO_REFRESH_GRANT,
]);
exports.KIRO_DEFAULT_POLL_INTERVAL_MS = 5000;
const KIRO_REGION_PATTERN = /^[a-z]{2}(?:-[a-z0-9]+)+-\d$/;
function getKiroOidcBaseUrl(region = exports.KIRO_OIDC_DEFAULT_REGION) {
    return `https://oidc.${region}.amazonaws.com`;
}
function buildKiroRegisterUrl(baseUrl) {
    return `${baseUrl}/client/register`;
}
function buildKiroDeviceAuthorizationUrl(baseUrl) {
    return `${baseUrl}/device_authorization`;
}
function buildKiroTokenUrl(baseUrl) {
    return `${baseUrl}/token`;
}
class KiroAuthorizationOptionsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'KiroAuthorizationOptionsError';
    }
}
exports.KiroAuthorizationOptionsError = KiroAuthorizationOptionsError;
function normalizeKiroRegion(region) {
    const normalized = region.trim().toLowerCase();
    if (!KIRO_REGION_PATTERN.test(normalized)) {
        throw new KiroAuthorizationOptionsError('Kiro IAM Identity Center region is invalid.');
    }
    return normalized;
}
function normalizeKiroStartUrl(startUrl) {
    const trimmed = startUrl.trim();
    let parsed;
    try {
        parsed = new URL(trimmed);
    }
    catch {
        throw new KiroAuthorizationOptionsError('Kiro IAM Identity Center start URL is invalid.');
    }
    if (parsed.protocol !== 'https:') {
        throw new KiroAuthorizationOptionsError('Kiro IAM Identity Center start URL must use HTTPS.');
    }
    return parsed.toString();
}
var device_flow_2 = require("../core/device-flow");
Object.defineProperty(exports, "toAbsoluteExpiryTimestamp", { enumerable: true, get: function () { return device_flow_2.toAbsoluteExpiryTimestamp; } });
function toPollIntervalMs(interval) {
    return (0, device_flow_1.toPollIntervalMs)(interval, exports.KIRO_DEFAULT_POLL_INTERVAL_MS);
}
function isKiroOAuthTokenBlob(value) {
    if (!value || typeof value !== 'object')
        return false;
    const blob = value;
    return (blob.source === 'kiro-oidc' &&
        typeof blob.t === 'string' &&
        blob.t.length > 0 &&
        typeof blob.r === 'string' &&
        blob.r.length > 0 &&
        typeof blob.cid === 'string' &&
        typeof blob.cs === 'string' &&
        typeof blob.e === 'number' &&
        Number.isFinite(blob.e));
}
function parseKiroOAuthTokenBlob(rawValue) {
    try {
        const parsed = JSON.parse(rawValue);
        return isKiroOAuthTokenBlob(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
function serializeKiroOAuthTokenBlob(blob) {
    return JSON.stringify(blob);
}
//# sourceMappingURL=kiro-oidc.js.map