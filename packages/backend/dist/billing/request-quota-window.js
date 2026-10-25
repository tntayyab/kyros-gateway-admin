"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_USAGE_CUTOVER_STATE = exports.REQUEST_QUOTA_RESET_AT_ENV = exports.DEFAULT_REQUEST_QUOTA_RESET_AT = void 0;
exports.requestQuotaResetAtMs = requestQuotaResetAtMs;
exports.requestQuotaWindowStartMs = requestQuotaWindowStartMs;
exports.DEFAULT_REQUEST_QUOTA_RESET_AT = '2026-07-09T09:06:52Z';
exports.REQUEST_QUOTA_RESET_AT_ENV = 'PLAN_REQUEST_QUOTA_RESET_AT';
exports.REQUEST_USAGE_CUTOVER_STATE = 'tenant_request_usage_cutover_v1';
function requestQuotaResetAtMs() {
    const raw = process.env[exports.REQUEST_QUOTA_RESET_AT_ENV]?.trim() || exports.DEFAULT_REQUEST_QUOTA_RESET_AT;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : Date.parse(exports.DEFAULT_REQUEST_QUOTA_RESET_AT);
}
function requestQuotaWindowStartMs(monthStartMs) {
    return Math.max(monthStartMs, requestQuotaResetAtMs());
}
//# sourceMappingURL=request-quota-window.js.map