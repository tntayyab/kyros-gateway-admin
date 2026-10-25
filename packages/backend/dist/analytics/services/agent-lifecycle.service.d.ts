import { DataSource, Repository } from 'typeorm';
import { Agent } from '../../entities/agent.entity';
import { ResolveAgentService } from '../../routing/routing-core/resolve-agent.service';
import { RoutingCacheService } from '../../routing/routing-core/routing-cache.service';
import { AgentKeyAuthGuard } from '../../otlp/guards/agent-key-auth.guard';
export declare class AgentLifecycleService {
    private readonly agentRepo;
    private readonly dataSource;
    private readonly resolveAgent;
    private readonly routingCache;
    private readonly otlpAuthGuard;
    constructor(agentRepo: Repository<Agent>, dataSource: DataSource, resolveAgent: ResolveAgentService, routingCache: RoutingCacheService, otlpAuthGuard: AgentKeyAuthGuard);
    findAgentInfo(tenantId: string | null, agentName: string): Promise<{
        agent_name: string;
        display_name: string;
        agent_category: string | null;
        agent_platform: string | null;
    } | null>;
    deleteAgent(tenantId: string | null, agentName: string): Promise<void>;
    private findAgentByTenant;
    updateAgentType(tenantId: string | null, agentName: string, fields: {
        agent_category?: string;
        agent_platform?: string;
    }): Promise<void>;
    renameAgent(tenantId: string | null, currentName: string, newName: string, displayName?: string): Promise<void>;
}
