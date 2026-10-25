import type { AgentScope } from './analytics-scope.service';
import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
export interface DispositionRow {
    bucket: string;
    dim: string | null;
    count: string;
}
export interface DispositionTotals {
    total: number;
    success: number;
    healed: number;
    fallback: number;
    error: number;
}
export interface VolumeSeriesRow {
    [bucketAlias: string]: unknown;
    messages: string | number;
}
export interface ConnectionScope {
    tenantProviderId?: string;
    provider?: string;
    authType?: string;
    label?: string;
}
export interface DimensionVolumeRow {
    key: string;
    requests: number;
    failed: number;
    succeeded: number;
    healed: number;
    fallback: number;
}
export declare class RequestVolumeService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<AgentMessage>);
    private terminalCte;
    private params;
    private connectionPredicate;
    getDispositionTotalsForWindows(params: {
        tenantId: string | null;
        from: string;
        splitAt: string;
        to?: string;
        agentScope?: AgentScope;
    }): Promise<{
        current: DispositionTotals;
        previous: DispositionTotals;
    }>;
    getDispositionTimeseries(params: {
        tenantId: string | null;
        range: string;
        hourly: boolean;
        agentScope?: AgentScope;
        failedOnly?: boolean;
        connection?: ConnectionScope;
    }): Promise<DispositionRow[]>;
    getVolumeByAgentTimeseries(range: string, tenantId: string | null, hourly: boolean): Promise<Array<Record<string, unknown>>>;
    getVolumeByDimension(dim: 'provider' | 'agent_name' | 'model', params: {
        tenantId: string | null;
        range?: string;
        agentScope?: AgentScope;
    }): Promise<DimensionVolumeRow[]>;
}
