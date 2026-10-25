export declare class EmailProviderConfig {
    id: string;
    tenant_id: string;
    created_by_user_id: string | null;
    provider: string;
    api_key_encrypted: string;
    key_prefix: string | null;
    domain: string | null;
    notification_email: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
