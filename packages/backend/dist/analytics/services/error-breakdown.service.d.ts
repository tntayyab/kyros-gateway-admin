import type { AgentScope } from './analytics-scope.service';
import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
export interface ErrorBreakdownResponse {
    range: string;
    successful: number;
    total_errors: number;
    provider_errors: number;
    transport_errors: number;
    manifest_errors: number;
    auto_fixed: number;
    by_origin: Record<string, number>;
    by_class: Record<string, number>;
    provider_error_rate: number;
}
export declare class ErrorBreakdownService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<AgentMessage>);
    getBreakdown(params: {
        tenantId: string | null;
        range?: string;
        agentScope?: AgentScope;
    }): Promise<ErrorBreakdownResponse>;
    private queryErrorGroups;
    private querySuccessful;
    private queryAutoFixed;
    private assemble;
}
