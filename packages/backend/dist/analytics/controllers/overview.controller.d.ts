import { AnalyticsScopeService } from '../services/analytics-scope.service';
import { RangeQueryDto } from '../../common/dto/range-query.dto';
import { AggregationService } from '../services/aggregation.service';
import { TimeseriesQueriesService } from '../services/timeseries-queries.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { ProviderService } from '../../routing/routing-core/provider.service';
import { Repository } from 'typeorm';
import { AgentEnabledProvider } from '../../entities/agent-enabled-provider.entity';
import { MessagesQueryService } from '../services/messages-query.service';
import { OverviewQueryDto } from '../dto/overview-query.dto';
export declare class OverviewController {
    private readonly analyticsScope;
    private readonly aggregation;
    private readonly timeseries;
    private readonly providerService;
    private readonly enabledProviderRepo;
    private readonly messagesQuery?;
    constructor(analyticsScope: AnalyticsScopeService, aggregation: AggregationService, timeseries: TimeseriesQueriesService, providerService: ProviderService, enabledProviderRepo: Repository<AgentEnabledProvider>, messagesQuery?: MessagesQueryService | undefined);
    getOverview(query: OverviewQueryDto, ctx: TenantContext): Promise<{
        summary: {
            tokens_today: import("../services/query-helpers").MetricWithTrend;
            cost_today: import("../services/query-helpers").MetricWithTrend;
            messages: import("../services/query-helpers").MetricWithTrend;
            services_hit: {
                total: number;
                healthy: number;
                issues: number;
            };
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
        cost_usage: {
            date: string;
            cost: number;
        }[] | {
            hour?: string;
            date?: string;
            cost: number;
        }[];
        message_usage: {
            date: string;
            count: number;
        }[] | {
            hour?: string;
            date?: string;
            count: number;
        }[];
        cost_by_model: {
            model: string;
            display_name: string;
            tokens: number;
            share_pct: number;
            estimated_cost: number;
            auth_type: string | null;
            provider: string | null;
            custom_provider_name: string | null;
        }[];
        recent_activity: any[];
        active_skills: {
            name: string;
            agent_name: string | null;
            run_count: number;
            last_active_at: string;
            status: "active";
        }[];
        request_reliability: {
            total: number;
            successful: number;
            success_rate: number;
            attempt_success_rate: number;
            manifest_lift_pct: number;
            recovered: number;
            previous_total: number;
        } | null;
        has_data: boolean;
        has_providers: boolean;
    }>;
    getOverviewDetails(query: RangeQueryDto, ctx: TenantContext): Promise<{
        cost_by_model: {
            model: string;
            display_name: string;
            tokens: number;
            share_pct: number;
            estimated_cost: number;
            auth_type: string | null;
            provider: string | null;
            custom_provider_name: string | null;
        }[];
        recent_activity: any[];
        request_reliability: {
            total: number;
            successful: number;
            success_rate: number;
            attempt_success_rate: number;
            manifest_lift_pct: number;
            recovered: number;
            previous_total: number;
        };
        active_skills: {
            name: string;
            agent_name: string | null;
            run_count: number;
            last_active_at: string;
            status: "active";
        }[];
    }>;
    getPerAgentTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerAgentMessageTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerAgentCostTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getOverviewAgentsUsage(query: RangeQueryDto, ctx: TenantContext): Promise<import("../services/timeseries-queries.service").UsageTimeseries>;
    getPerProviderTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerProviderMessageTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerProviderCostTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getOverviewProvidersUsage(query: RangeQueryDto, ctx: TenantContext): Promise<import("../services/timeseries-queries.service").UsageTimeseries>;
    getPerModelCostTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerModelTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerModelMessageTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    private deriveTimeseriesArgs;
    private deriveScopedTimeseriesArgs;
    private hasActiveProviders;
    private getRecentActivity;
}
