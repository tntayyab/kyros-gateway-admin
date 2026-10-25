import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
export interface ProviderUsageSummary {
    provider: string;
    auth_type: string;
    key_label: string;
    consumption_tokens: number;
    consumption_messages: number;
    consumption_cost: number;
    attempts_30d: number;
    succeeded_30d: number;
    last_used_at: string | null;
    sparkline_7d: number[];
}
export declare class ProviderUsageService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<AgentMessage>);
    private utcDayLabels;
    getUsage(tenantId: string | null): Promise<ProviderUsageSummary[]>;
}
