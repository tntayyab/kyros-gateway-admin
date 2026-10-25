import type { PhoenixExplanation, PhoenixHealStatus, PhoenixOperation, PhoenixProviderError } from './phoenix.types';
export type AutofixOutcome = 'healed' | 'unfixable' | 'resolving' | 'exhausted';
export interface AutofixChainEntry {
    attempt: number;
    origin: 'original' | 'autofix';
    request: Record<string, unknown>;
    http_status: number;
    error?: PhoenixProviderError;
    phoenix_status?: PhoenixHealStatus;
    issue_id?: string;
    patch_id?: string | null;
    heal_attempt_id?: string | null;
    operations?: PhoenixOperation[] | null;
    explanation?: PhoenixExplanation | null;
    patch_worked?: boolean;
}
export interface AutofixRecord {
    groupId: string;
    outcome: AutofixOutcome;
    original_http_status: number;
    chain: AutofixChainEntry[];
}
export declare function getAutofixRetry(autofix: AutofixRecord | undefined): AutofixChainEntry | undefined;
