import { Agent } from './agent.entity';
import { TenantProvider } from './tenant-provider.entity';
export declare class AgentEnabledProvider {
    agent_id: string;
    agent: Agent;
    tenant_provider_id: string;
    tenantProvider: TenantProvider;
}
