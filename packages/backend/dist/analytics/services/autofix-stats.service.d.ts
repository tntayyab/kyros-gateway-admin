import type { AgentScope } from './analytics-scope.service';
import { Repository } from 'typeorm';
import { Agent } from '../../entities/agent.entity';
import { AgentMessage } from '../../entities/agent-message.entity';
import { AutofixService } from '../../routing/autofix/autofix.service';
import { InstallMetadata } from '../../entities/install-metadata.entity';
import { RequestVolumeService } from './request-volume.service';
export interface AutofixStatusResponse {
    any_enabled: boolean;
    enabled_agents: string[];
    disabled_agents: string[];
    needs_enable_all: boolean;
    consented: boolean;
}
export interface AutofixStatsResponse {
    success_rate: {
        value: number;
        previous: number;
    };
    autofix_saves: {
        value: number;
        previous: number;
    };
    fallback_saves: {
        value: number;
        previous: number;
    };
    total_requests: {
        value: number;
        previous: number;
    };
    errors_remaining: {
        value: number;
        previous: number;
    };
    coverage: {
        rate: number;
        previous_rate: number;
    };
    dispositions: {
        healed: number;
        no_fix_found: number;
        resolving: number;
        ineffective: number;
    };
    needs_attention: Array<{
        error_message: string;
        provider: string;
        model: string;
        count: number;
        phoenix_issue_id: string | null;
    }>;
}
export declare const AUTOFIX_TS_DIMENSIONS: readonly ["disposition", "http_status", "provider", "error_kind", "autofix"];
export type AutofixTsDimension = (typeof AUTOFIX_TS_DIMENSIONS)[number];
export interface AutofixTimeseriesResponse {
    range: string;
    by: string;
    keys: string[];
    buckets: Array<{
        bucket: string;
        counts: number[];
    }>;
}
export declare class AutofixStatsService {
    private readonly agentRepo;
    private readonly messageRepo;
    private readonly installMetadataRepo;
    private readonly autofix;
    private readonly requestVolume;
    constructor(agentRepo: Repository<Agent>, messageRepo: Repository<AgentMessage>, installMetadataRepo: Repository<InstallMetadata>, autofix: AutofixService, requestVolume: RequestVolumeService);
    getWorkspaceStatus(tenantId: string | null): Promise<AutofixStatusResponse>;
    enableAll(tenantId: string): Promise<AutofixStatusResponse>;
    private hasConsent;
    recordAutofixConsent(): Promise<void>;
    getStats(params: {
        tenantId: string | null;
        range?: string;
        agentScope?: AgentScope;
    }): Promise<AutofixStatsResponse>;
    getPerProviderStats(params: {
        tenantId: string | null;
        range?: string;
        agentScope?: AgentScope;
    }): Promise<Array<{
        provider: string;
        auth_type: string;
        key_label: string;
        attempts: number;
        failed: number;
        succeeded: number;
    }>>;
    getPerAgentStats(params: {
        tenantId: string | null;
        range?: string;
    }): Promise<Array<{
        agent_name: string;
        requests: number;
        failed: number;
        autofixed: number;
        fallback_saves: number;
        succeeded: number;
    }>>;
    getPerModelStats(params: {
        tenantId: string | null;
        range?: string;
        agentScope?: AgentScope;
    }): Promise<Array<{
        model: string;
        attempts: number;
        failed: number;
        succeeded: number;
    }>>;
    getTimeseries(params: {
        tenantId: string | null;
        range?: string;
        by?: string;
        agentScope?: AgentScope;
        failedOnly?: boolean;
    }): Promise<AutofixTimeseriesResponse>;
    private dimensionExpr;
    private pivotTimeseries;
    private windowCounts;
    private queryNeedsAttention;
}
