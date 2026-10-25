"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestError = exports.MANIFEST_CODE_TO_REASON = exports.UNRECORDABLE_MANIFEST_CODES = exports.MANIFEST_BLOCKED_REQUEST_REASONS = void 0;
exports.isRecordableManifestCode = isRecordableManifestCode;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("./error-codes");
exports.MANIFEST_BLOCKED_REQUEST_REASONS = [
    'no_provider',
    'no_provider_key',
    'subscription_credentials_unusable',
    'key_expired',
    'limit_exceeded',
    'plan_request_limit_exceeded',
    'manifest_rate_limited',
    'manifest_ip_rate_limited',
    'manifest_concurrency_limited',
    'manifest_invalid_request',
    'local_provider_unavailable',
    'model_not_available',
    'manifest_internal_error',
];
exports.UNRECORDABLE_MANIFEST_CODES = ['M001', 'M002', 'M003', 'M005'];
exports.MANIFEST_CODE_TO_REASON = {
    M004: 'key_expired',
    M100: 'no_provider_key',
    M101: 'no_provider',
    M102: 'subscription_credentials_unusable',
    M200: 'limit_exceeded',
    M201: 'manifest_rate_limited',
    M202: 'manifest_ip_rate_limited',
    M203: 'manifest_concurrency_limited',
    M204: 'plan_request_limit_exceeded',
    M300: 'manifest_invalid_request',
    M302: 'model_not_available',
    M303: 'local_provider_unavailable',
    M500: 'manifest_internal_error',
};
function isRecordableManifestCode(code) {
    return !exports.UNRECORDABLE_MANIFEST_CODES.includes(code);
}
class ManifestError extends common_1.HttpException {
    code;
    constructor(code, status, vars = {}) {
        super((0, error_codes_1.formatManifestError)(code, vars), status);
        this.code = code;
    }
    get title() {
        return error_codes_1.MANIFEST_ERRORS[this.code].title;
    }
}
exports.ManifestError = ManifestError;
//# sourceMappingURL=manifest-error.js.map