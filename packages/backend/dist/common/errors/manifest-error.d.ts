import { HttpException } from '@nestjs/common';
import { type ManifestErrorCode } from './error-codes';
export declare const MANIFEST_BLOCKED_REQUEST_REASONS: readonly ["no_provider", "no_provider_key", "subscription_credentials_unusable", "key_expired", "limit_exceeded", "plan_request_limit_exceeded", "manifest_rate_limited", "manifest_ip_rate_limited", "manifest_concurrency_limited", "manifest_invalid_request", "local_provider_unavailable", "model_not_available", "manifest_internal_error"];
export type ManifestBlockedRequestReason = (typeof MANIFEST_BLOCKED_REQUEST_REASONS)[number];
export declare const UNRECORDABLE_MANIFEST_CODES: readonly ["M001", "M002", "M003", "M005"];
export type UnrecordableManifestCode = (typeof UNRECORDABLE_MANIFEST_CODES)[number];
export type RecordableManifestCode = Exclude<ManifestErrorCode, UnrecordableManifestCode>;
export declare const MANIFEST_CODE_TO_REASON: Record<RecordableManifestCode, ManifestBlockedRequestReason>;
export declare function isRecordableManifestCode(code: ManifestErrorCode): code is RecordableManifestCode;
export declare class ManifestError extends HttpException {
    readonly code: ManifestErrorCode;
    constructor(code: ManifestErrorCode, status: number, vars?: Record<string, string | number>);
    get title(): string;
}
