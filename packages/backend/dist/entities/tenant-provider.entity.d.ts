import type { AuthType } from 'manifest-shared';
import type { DiscoveredModel } from '../model-discovery/model-fetcher';
export declare class TenantProvider {
    id: string;
    tenant_id: string;
    created_by_user_id: string | null;
    agent_id: string | null;
    provider: string;
    api_key_encrypted: string | null;
    key_prefix: string | null;
    auth_type: AuthType;
    label: string;
    priority: number;
    region: string | null;
    is_active: boolean;
    connected_at: string;
    updated_at: string;
    cached_models: DiscoveredModel[] | null;
    models_fetched_at: string | null;
}
