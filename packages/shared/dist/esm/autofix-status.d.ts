export declare const AUTOFIX_STATUSES: readonly ["no_patch", "resolving", "retry_succeeded", "retry_failed", "service_error"];
export type AutofixStatus = (typeof AUTOFIX_STATUSES)[number];
export declare const AUTOFIX_STATUS_LABELS: Record<AutofixStatus, string>;
export interface AutofixStatusChainEntry {
    origin: 'original' | 'autofix';
    http_status: number;
    phoenix_status?: string;
    heal_attempt_id?: string | null;
    patch_worked?: boolean;
}
export interface AutofixStatusRecord {
    chain: AutofixStatusChainEntry[];
}
/** Derive the request-level Autofix outcome from its recorded execution. */
export declare function deriveAutofixStatus(record: AutofixStatusRecord | null | undefined): AutofixStatus | null;
//# sourceMappingURL=autofix-status.d.ts.map