import type { AgentScope } from './analytics-scope.service';
import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
export interface AttemptMetric {
    value: number;
    previous: number;
}
export interface AttemptStatsResponse {
    total_attempts: AttemptMetric;
    fallbacked_attempts: AttemptMetric;
}
export declare const ATTEMPT_METRIC_KEYS: readonly ["total_attempts", "fallbacked_attempts"];
export interface AttemptTimeseriesResponse {
    range: string;
    by: 'metric';
    keys: string[];
    buckets: Array<{
        bucket: string;
        counts: number[];
    }>;
}
export declare class AttemptStatsService {
    private readonly attemptRepo;
    constructor(attemptRepo: Repository<AgentMessage>);
    getStats(params: {
        tenantId: string | null;
        range?: string;
        agentScope?: AgentScope;
    }): Promise<AttemptStatsResponse>;
    getTimeseries(params: {
        tenantId: string | null;
        range?: string;
        agentScope?: AgentScope;
    }): Promise<AttemptTimeseriesResponse>;
    private scopeToConnectionWithLegacyFold;
    getConnectionStatusTimeseries(params: {
        tenantId: string | null;
        range?: string;
        authType?: string;
        provider?: string;
        label?: string;
        tenantProviderId?: string;
    }): Promise<AttemptTimeseriesResponse>;
    getConnectionAttemptsByAgentTimeseries(params: {
        tenantId: string | null;
        range?: string;
        authType?: string;
        provider?: string;
        label?: string;
        tenantProviderId?: string;
    }): Promise<{
        agents: string[];
        timeseries: Array<Record<string, number | string>>;
    }>;
    getConnectionHttpStatusTimeseries(params: {
        tenantId: string | null;
        range?: string;
        authType?: string;
        provider?: string;
        label?: string;
        tenantProviderId?: string;
    }): Promise<AttemptTimeseriesResponse>;
    getConnectionBreakdown(params: {
        tenantId: string | null;
        range?: string;
        authType?: string;
        provider?: string;
        label?: string;
        tenantProviderId?: string;
    }): Promise<{
        attempts: number;
        succeeded: number;
        failed: number;
        fallback_retries: number;
        fallback_retries_succeeded: number;
        autofix_attempts: number;
        autofix_attempts_succeeded: number;
    }>;
    private queryWindow;
}
