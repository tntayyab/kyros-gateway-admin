import { Tenant } from './tenant.entity';
import { AgentApiKey } from './agent-api-key.entity';
export declare class Agent {
    id: string;
    name: string;
    display_name: string | null;
    description: string | null;
    agent_category: string | null;
    agent_platform: string | null;
    is_active: boolean;
    complexity_routing_enabled: boolean;
    autofix_enabled: boolean | null;
    record_messages: boolean;
    is_playground: boolean;
    tenant: Tenant;
    tenant_id: string;
    apiKey: AgentApiKey;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
