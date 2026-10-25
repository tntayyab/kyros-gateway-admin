import { AnalyticsScopeService } from '../services/analytics-scope.service';
import { Repository } from 'typeorm';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { AggregationService } from '../services/aggregation.service';
import { AutofixStatsService } from '../services/autofix-stats.service';
import { AttemptStatsService } from '../services/attempt-stats.service';
import { TimeseriesQueriesService } from '../services/timeseries-queries.service';
import { TenantProvider } from '../../entities/tenant-provider.entity';
import { AgentMessage } from '../../entities/agent-message.entity';
export declare class ProviderAnalyticsController {
    private readonly analyticsScope;
    private readonly aggregation;
    private readonly timeseries;
    private readonly autofixStats;
    private readonly attemptStats;
    private readonly providerRepo;
    private readonly messageRepo;
    constructor(analyticsScope: AnalyticsScopeService, aggregation: AggregationService, timeseries: TimeseriesQueriesService, autofixStats: AutofixStatsService, attemptStats: AttemptStatsService, providerRepo: Repository<TenantProvider>, messageRepo: Repository<AgentMessage>);
    getAttemptStatusTimeseries(ctx: TenantContext, range?: string, authType?: string, provider?: string, label?: string, connectionId?: string): Promise<import("../services/attempt-stats.service").AttemptTimeseriesResponse>;
    getAttemptHttpStatusTimeseries(ctx: TenantContext, range?: string, authType?: string, provider?: string, label?: string, connectionId?: string): Promise<import("../services/attempt-stats.service").AttemptTimeseriesResponse>;
    getAttemptBreakdown(ctx: TenantContext, range?: string, authType?: string, provider?: string, label?: string, connectionId?: string): Promise<{
        attempts: number;
        succeeded: number;
        failed: number;
        fallback_retries: number;
        fallback_retries_succeeded: number;
        autofix_attempts: number;
        autofix_attempts_succeeded: number;
    }>;
    getAttemptsByAgentTimeseries(ctx: TenantContext, range?: string, authType?: string, provider?: string, label?: string, connectionId?: string): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getAnalytics(ctx: TenantContext, authType?: string, range?: string, agentName?: string, provider?: string, label?: string, connectionId?: string): Promise<{
        summary: {
            messages: import("../services/query-helpers").MetricWithTrend;
            tokens: import("../services/query-helpers").MetricWithTrend;
        };
        token_usage: {
            date: string;
            input_tokens: number;
            output_tokens: number;
        }[] | {
            hour?: string;
            date?: string;
            input_tokens: number;
            output_tokens: number;
        }[];
        message_usage: {
            date: string;
            count: number;
        }[] | {
            hour?: string;
            date?: string;
            count: number;
        }[];
        attempts: {
            total: number;
            successful: number;
            success_rate: number;
        };
    }>;
    private getAttemptReliability;
    getPerAgentTimeseries(ctx: TenantContext, authType?: string, provider?: string, range?: string, label?: string, connectionId?: string): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerAgentMessageTimeseries(ctx: TenantContext, authType?: string, provider?: string, range?: string, label?: string, connectionId?: string): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerAgentCostTimeseries(ctx: TenantContext, authType?: string, provider?: string, range?: string, label?: string, connectionId?: string): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getAgents(ctx: TenantContext, authType?: string): Promise<{
        agents: string[];
    }>;
    getConnectionDetail(ctx: TenantContext, connectionId?: string): Promise<{
        connection: null;
        agents: never[];
        model_usage: never[];
        recent_messages: never[];
    } | {
        connection: {
            id: string;
            provider: string;
            auth_type: "api_key" | "local" | "subscription";
            label: string;
            cached_model_count: number;
            key_prefix: string | null;
            connected_at: string;
            is_active: boolean;
            last_used_at: any;
        };
        agents: {
            agent_name: string;
            agent_platform: string | null;
            tokens_30d: number;
            cost_30d: number;
            messages_30d: number;
            attempts_30d: number;
            succeeded_30d: number;
            pct_of_total: number;
            last_used: string | null;
        }[];
        model_usage: {
            model: string;
            tokens: number;
            cost: number;
            messages: number;
            pct_of_total: number;
        }[];
        recent_messages: any[];
    }>;
    private validateRange;
}
