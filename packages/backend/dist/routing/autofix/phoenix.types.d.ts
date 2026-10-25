import type { ProviderWireFormat, ProxyApiMode } from '../proxy/proxy-types';
import type { AuthType } from 'manifest-shared';
export interface PhoenixProviderError {
    message: string;
    type?: string | null;
    param?: string | null;
    code?: string | null;
}
export interface PhoenixProviderResponse {
    statusCode: number;
    error: PhoenixProviderError;
}
export interface PhoenixProviderExchange {
    format: ProviderWireFormat;
    url?: string;
    request: {
        body: Record<string, unknown>;
        redactedFields?: string[];
    };
    response: {
        statusCode: number;
        body: unknown;
    };
}
export interface HealRequest {
    traceId: string;
    tenantId: string;
    provider: string;
    model?: string;
    authType: AuthType;
    api: ProxyApiMode;
    url?: string;
    request: Record<string, unknown>;
    response: PhoenixProviderResponse;
    providerExchange?: PhoenixProviderExchange;
    responseTimeMs?: number;
    responseSizeBytes?: number;
}
export declare const HEAL_STATUSES: readonly ["patched", "unverified", "resolving", "no_patch"];
export type PhoenixHealStatus = (typeof HEAL_STATUSES)[number];
export interface PhoenixOperation {
    type: string;
    from?: string;
    to?: string;
}
export interface PhoenixExplanation {
    summary: string;
    operations: Array<{
        type: string;
        detail: string;
    }>;
    source: 'deterministic' | 'agent' | 'operator';
}
export interface HealResponse {
    status: PhoenixHealStatus;
    issueId: string;
    patchId?: string | null;
    healAttemptId?: string | null;
    operations?: PhoenixOperation[] | null;
    explanation?: PhoenixExplanation | null;
    healedBody?: Record<string, unknown> | null;
    retryAfterMs?: number | null;
}
export interface HealOutcome {
    retryStatusCode: number;
    error?: PhoenixProviderError;
}
export declare const ISSUE_STATUSES: readonly ["resolving", "unverified", "verified", "ineffective", "no_fix_found"];
export type PhoenixIssueStatus = (typeof ISSUE_STATUSES)[number];
export declare const OUTCOME_STATUSES: readonly ["succeeded", "failed", "expired"];
export type OutcomeStatus = (typeof OUTCOME_STATUSES)[number];
export interface ConfirmResponse {
    healAttemptId: string;
    status: OutcomeStatus;
    issueStatus: string;
}
