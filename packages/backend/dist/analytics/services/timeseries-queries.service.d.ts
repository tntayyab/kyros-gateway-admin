import type { AgentScope } from './analytics-scope.service';
import { DataSource, Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import { RequestVolumeService } from './request-volume.service';
import { Agent } from '../../entities/agent.entity';
import { ManifestRequest } from '../../entities/request.entity';
import { AgentUsageDailyService } from './agent-usage-daily.service';
export interface PivotedTimeseries {
    agents: string[];
    timeseries: Array<Record<string, number | string>>;
}
export interface UsageTimeseries {
    tokenUsage: PivotedTimeseries;
    messageUsage: PivotedTimeseries;
    costUsage: PivotedTimeseries;
}
export declare class TimeseriesQueriesService {
    private readonly turnRepo;
    private readonly agentRepo;
    private readonly requestRepo?;
    private readonly requestVolume?;
    private readonly dataSource?;
    private readonly agentUsageDaily?;
    constructor(turnRepo: Repository<AgentMessage>, agentRepo: Repository<Agent>, requestRepo?: Repository<ManifestRequest> | undefined, requestVolume?: RequestVolumeService | undefined, dataSource?: DataSource | undefined, agentUsageDaily?: AgentUsageDailyService | undefined);
    getTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope, authType?: string, provider?: string, excludePlayground?: boolean, label?: string, tenantProviderId?: string, excludeDirect?: boolean): Promise<{
        tokenUsage: {
            date: string;
            input_tokens: number;
            output_tokens: number;
        }[];
        costUsage: {
            date: string;
            cost: number;
        }[];
        messageUsage: {
            date: string;
            count: number;
        }[];
    } | {
        tokenUsage: {
            hour?: string;
            date?: string;
            input_tokens: number;
            output_tokens: number;
        }[];
        costUsage: {
            hour?: string;
            date?: string;
            cost: number;
        }[];
        messageUsage: {
            hour?: string;
            date?: string;
            count: number;
        }[];
    }>;
    getActiveSkills(range: string, tenantId: string | null, agentScope?: AgentScope, excludePlayground?: boolean, excludeDirect?: boolean): Promise<{
        name: string;
        agent_name: string | null;
        run_count: number;
        last_active_at: string;
        status: "active";
    }[]>;
    getRecentActivity(range: string, tenantId: string | null, limit?: number, agentScope?: AgentScope, excludePlayground?: boolean, excludeDirect?: boolean): Promise<any[]>;
    getCostByModel(range: string, tenantId: string | null, agentScope?: AgentScope, excludePlayground?: boolean, excludeDirect?: boolean): Promise<{
        model: string;
        display_name: string;
        tokens: number;
        share_pct: number;
        estimated_cost: number;
        auth_type: string | null;
        provider: string | null;
        custom_provider_name: string | null;
    }[]>;
    getAgentList(tenantId: string | null, includePlayground?: boolean): Promise<{
        agent_name: string;
        display_name: string;
        agent_category: string | null;
        agent_platform: string | null;
        message_count: number;
        last_active: string;
        total_cost: number;
        total_tokens: number;
        sparkline: number[];
    }[]>;
    private foldAgentUsageRows;
    getPerAgentTimeseries(range: string, tenantId: string | null, hourly: boolean, authType?: string, provider?: string, label?: string, tenantProviderId?: string): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerAgentMessageTimeseries(range: string, tenantId: string | null, hourly: boolean, authType?: string, provider?: string, label?: string, tenantProviderId?: string): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerAgentCostTimeseries(range: string, tenantId: string | null, hourly: boolean, authType?: string, provider?: string, label?: string, tenantProviderId?: string): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getAgentUsageTimeseries(range: string, tenantId: string | null, hourly: boolean, authType?: string, provider?: string, label?: string, tenantProviderId?: string): Promise<UsageTimeseries>;
    getPerProviderTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerProviderMessageTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerModelTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerModelMessageTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getPerProviderCostTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getProviderUsageTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope): Promise<UsageTimeseries>;
    getPerModelCostTimeseries(range: string, tenantId: string | null, hourly: boolean, agentScope?: AgentScope): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getAgentNamesByAuthType(authType: string, tenantId: string | null): Promise<string[]>;
    private withCompatibilitySnapshot;
    private parseBucketRow;
}
