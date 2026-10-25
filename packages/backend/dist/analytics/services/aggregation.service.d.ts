import type { AgentScope } from './analytics-scope.service';
import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import { MetricWithTrend } from './query-helpers';
import { ManifestRequest } from '../../entities/request.entity';
import { AgentUsageDailyService } from './agent-usage-daily.service';
export { MetricWithTrend };
export declare class AggregationService {
    private readonly turnRepo;
    private readonly requestRepo?;
    private readonly agentUsageDaily?;
    constructor(turnRepo: Repository<AgentMessage>, requestRepo?: Repository<ManifestRequest> | undefined, agentUsageDaily?: AgentUsageDailyService | undefined);
    hasAnyData(tenantId: string | null, agentScope?: AgentScope, excludePlayground?: boolean, excludeDirect?: boolean): Promise<boolean>;
    getPreviousTokenTotal(range: string, tenantId: string | null, agentScope?: AgentScope): Promise<number>;
    getPreviousCostTotal(range: string, tenantId: string | null, agentScope?: AgentScope): Promise<number>;
    getSummaryMetrics(range: string, tenantId: string | null, agentScope?: AgentScope, authType?: string, provider?: string, excludePlayground?: boolean, label?: string, tenantProviderId?: string): Promise<{
        tokens: {
            tokens_today: MetricWithTrend;
            input_tokens: number;
            output_tokens: number;
        };
        cost: MetricWithTrend;
        messages: MetricWithTrend;
    }>;
    getPreviousWindowMetrics(range: string, tenantId: string | null, agentScope?: AgentScope, excludePlayground?: boolean, excludeDirect?: boolean): Promise<{
        tokens: number;
        cost: number;
        messages: number;
    }>;
    getRequestReliability(range: string, tenantId: string | null, agentScope?: AgentScope, excludePlayground?: boolean, excludeDirect?: boolean): Promise<{
        total: number;
        successful: number;
        success_rate: number;
        attempt_success_rate: number;
        manifest_lift_pct: number;
        recovered: number;
        previous_total: number;
    }>;
    static buildSummary(current: {
        input: number;
        output: number;
        cost: number;
        messages: number;
    }, previous: {
        tokens: number;
        cost: number;
        messages: number;
    }): {
        tokens: {
            tokens_today: MetricWithTrend;
            input_tokens: number;
            output_tokens: number;
        };
        cost: MetricWithTrend;
        messages: MetricWithTrend;
    };
    private computeWindow;
    private buildPreviousWindowQuery;
}
