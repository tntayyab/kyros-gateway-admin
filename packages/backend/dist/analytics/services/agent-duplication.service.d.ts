import { DataSource, Repository } from 'typeorm';
import { Agent } from '../../entities/agent.entity';
import { RoutingCacheService } from '../../routing/routing-core/routing-cache.service';
export interface DuplicateAgentSummary {
    providers: number;
    tierAssignments: number;
    specificityAssignments: number;
    modelParams: number;
}
export interface DuplicateAgentResult {
    agentId: string;
    agentName: string;
    displayName: string;
    apiKey: string;
    copied: DuplicateAgentSummary;
}
export declare class AgentDuplicationService {
    private readonly agentRepo;
    private readonly dataSource;
    private readonly routingCache;
    constructor(agentRepo: Repository<Agent>, dataSource: DataSource, routingCache: RoutingCacheService);
    private generateOtlpKey;
    private findOwnedAgent;
    getCopySummary(tenantId: string | null, sourceName: string): Promise<DuplicateAgentSummary>;
    suggestName(tenantId: string | null, sourceName: string): Promise<string>;
    duplicate(tenantId: string | null, sourceName: string, params: {
        name: string;
        displayName: string;
    }): Promise<DuplicateAgentResult>;
}
