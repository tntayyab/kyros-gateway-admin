import type { AgentScope } from './analytics-scope.service';
import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export interface AgentUsageDailyRow {
    agent_id: string;
    agent_name?: string;
    day: string;
    request_count: string;
    successful_request_count?: string;
    failed_request_count?: string;
    input_tokens: string;
    output_tokens: string;
    cost_usd: string;
    last_active_at: string | Date | null;
}
export interface AgentUsageBatchResult {
    acquired: boolean;
    processed: number;
    rollups: number;
}
export declare class AgentUsageDailyService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    private running;
    private automaticReadsConfirmed;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    readsEnabledFor(tenantId: string | null): boolean;
    refreshAutomaticReads(): Promise<void>;
    supportsRange(tenantId: string | null, range: string): tenantId is string;
    getRows(tenantId: string): Promise<AgentUsageDailyRow[]>;
    getRangeRows(tenantId: string, range: string, options?: {
        agentScope?: AgentScope;
        previous?: boolean;
        excludeDirect?: boolean;
    }): Promise<AgentUsageDailyRow[]>;
    runScheduled(): Promise<void>;
    processBatch(batchSize?: number): Promise<AgentUsageBatchResult>;
}
