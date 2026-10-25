import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
interface AgentScope {
    tenantId: string;
    agentId: string;
}
export interface AgentUsageResult {
    range: string;
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens: number;
    cache_creation_tokens: number;
    cache_read_rate: number;
    cache_write_rate: number;
    message_count: number;
    trend_pct: number;
}
export interface AgentCostsResult {
    range: string;
    total_cost_usd: number;
    trend_pct: number;
    by_model: {
        model: string;
        cost_usd: number;
        input_tokens: number;
        output_tokens: number;
    }[];
}
export declare class AgentAnalyticsService {
    private readonly turnRepo;
    constructor(turnRepo: Repository<AgentMessage>);
    getUsage(range: string, scope: AgentScope): Promise<AgentUsageResult>;
    getCosts(range: string, scope: AgentScope): Promise<AgentCostsResult>;
}
export {};
