"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_BODY_BYTES = void 0;
exports.isReportableStatus = isReportableStatus;
exports.scrubProviderUrl = scrubProviderUrl;
exports.scrubBody = scrubBody;
exports.toObservation = toObservation;
const manifest_shared_1 = require("manifest-shared");
const secret_scrub_1 = require("../../common/utils/secret-scrub");
const inline_image_redaction_1 = require("../proxy/inline-image-redaction");
const provider_error_normalizer_1 = require("./provider-error-normalizer");
const NON_REQUEST_SIDE = new Set([401, 402, 403, 429]);
exports.MAX_BODY_BYTES = 256 * 1024;
function isReportableStatus(status) {
    return status >= 400 && status < 500 && !NON_REQUEST_SIDE.has(status);
}
const CREDENTIAL_KEYS = new Set([
    'xapikey',
    'authorization',
    'apikey',
    'apisecret',
    'refreshtoken',
    'clientsecret',
    'accesstoken',
    'devicecode',
]);
function normalizeKey(key) {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function isPlainRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function scrubProviderUrl(raw) {
    try {
        const url = new URL(raw);
        for (const key of [...url.searchParams.keys()]) {
            if (/key|token|secret|signature|credential/i.test(key)) {
                url.searchParams.set(key, '[REDACTED]');
            }
        }
        return url.toString();
    }
    catch {
        return (0, secret_scrub_1.scrubSecrets)(raw);
    }
}
function scrubValue(value) {
    if (typeof value === 'string')
        return (0, secret_scrub_1.scrubSecrets)(value);
    if (Array.isArray(value))
        return value.map(scrubValue);
    if (!isPlainRecord(value))
        return value;
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
        const scrubbed = CREDENTIAL_KEYS.has(normalizeKey(key)) ? '[REDACTED]' : scrubValue(nested);
        out[(0, secret_scrub_1.scrubSecrets)(key)] = scrubbed;
    }
    return out;
}
function scrubBody(body) {
    const withoutImages = (0, inline_image_redaction_1.redactInlineImageDataUrls)(body);
    if (Buffer.byteLength(JSON.stringify(withoutImages), 'utf8') > exports.MAX_BODY_BYTES)
        return null;
    return scrubValue(withoutImages);
}
function toObservation(input) {
    if (!isReportableStatus(input.status))
        return null;
    if ((0, manifest_shared_1.isAnthropicExtraUsageError)({
        provider: input.provider,
        httpStatus: input.status,
        errorBody: input.errorBody,
    })) {
        return null;
    }
    const scrubbed = scrubBody(input.requestBody);
    if (!scrubbed)
        return null;
    const scrubbedProviderBody = input.providerWire ? scrubBody(input.providerWire.body) : null;
    if (input.providerWire && !scrubbedProviderBody)
        return null;
    const safeErrorBody = (0, secret_scrub_1.scrubSecrets)(input.errorBody);
    let providerResponseBody = safeErrorBody;
    try {
        providerResponseBody = JSON.parse(safeErrorBody);
    }
    catch {
    }
    return {
        traceId: input.traceId,
        tenantId: input.tenantId,
        provider: input.provider,
        model: input.model,
        authType: input.authType,
        api: input.apiMode,
        request: scrubbed,
        response: { statusCode: input.status, error: (0, provider_error_normalizer_1.normalizeProviderError)(input.errorBody) },
        ...(input.providerWire
            ? {
                providerExchange: {
                    format: input.providerWire.format,
                    ...(input.providerWire.url ? { url: scrubProviderUrl(input.providerWire.url) } : {}),
                    request: { body: scrubbedProviderBody, redactedFields: [] },
                    response: { statusCode: input.status, body: providerResponseBody },
                },
            }
            : {}),
        ...(input.responseTimeMs != null ? { responseTimeMs: input.responseTimeMs } : {}),
    };
}
//# sourceMappingURL=observation-payload.js.map