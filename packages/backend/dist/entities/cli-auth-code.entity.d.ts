export declare class CliAuthCode {
    id: string;
    code_hash: string;
    state: string;
    code_challenge: string | null;
    code_challenge_method: string | null;
    tenant_id: string;
    user_id: string | null;
    created_at: string;
    expires_at: string;
}
