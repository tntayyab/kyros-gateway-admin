import { Tenant } from './tenant.entity';
import { Agent } from './agent.entity';
export declare class AgentApiKey {
    id: string;
    key: string | null;
    key_hash: string;
    key_prefix: string;
    label: string | null;
    tenant: Tenant;
    tenant_id: string;
    agent: Agent;
    agent_id: string;
    is_active: boolean;
    expires_at: string | null;
    last_used_at: string | null;
    created_at: string;
}
