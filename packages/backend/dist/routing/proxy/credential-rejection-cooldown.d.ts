export declare const CREDENTIAL_REJECTION_COOLDOWN_MS: number;
export interface RejectedCredentialRef {
    tenantId?: string;
    connectionId?: string | null;
    provider: string;
    authType?: string;
    keyLabel?: string;
    model: string;
    secret: string;
}
export declare class CredentialRejectionCooldown {
    private readonly ttlMs;
    private readonly maxEntries;
    private readonly now;
    private readonly rejections;
    constructor(ttlMs?: number, maxEntries?: number, now?: () => number);
    reject(ref: RejectedCredentialRef): void;
    rejectedUntil(ref: RejectedCredentialRef): number | null;
    private evict;
}
