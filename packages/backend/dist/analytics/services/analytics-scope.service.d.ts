import { Repository } from 'typeorm';
import { Agent } from '../../entities/agent.entity';
export interface AgentScope {
    readonly tenantId: string | null;
    readonly agentName: string;
    readonly agentId: string | null;
}
export declare function agentScopeCacheKey(scope?: AgentScope): string;
export declare class AnalyticsScopeService {
    private readonly agentRepo;
    constructor(agentRepo: Repository<Agent>);
    resolve(tenantId: string | null, agentName?: string): Promise<AgentScope | undefined>;
}
