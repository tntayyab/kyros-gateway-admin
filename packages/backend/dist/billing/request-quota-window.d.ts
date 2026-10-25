export declare const DEFAULT_REQUEST_QUOTA_RESET_AT = "2026-07-09T09:06:52Z";
export declare const REQUEST_QUOTA_RESET_AT_ENV = "PLAN_REQUEST_QUOTA_RESET_AT";
export declare const REQUEST_USAGE_CUTOVER_STATE = "tenant_request_usage_cutover_v1";
export declare function requestQuotaResetAtMs(): number;
export declare function requestQuotaWindowStartMs(monthStartMs: number): number;
