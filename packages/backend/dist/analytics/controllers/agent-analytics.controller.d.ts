import { Request } from 'express';
import { IngestionContext } from '../../otlp/interfaces/ingestion-context.interface';
import { AgentAnalyticsService } from '../services/agent-analytics.service';
import { RangeQueryDto } from '../../common/dto/range-query.dto';
interface AuthenticatedRequest extends Request {
    ingestionContext: IngestionContext;
}
export declare class AgentAnalyticsController {
    private readonly analytics;
    constructor(analytics: AgentAnalyticsService);
    getUsage(query: RangeQueryDto, req: AuthenticatedRequest): Promise<{
        agentName: string;
        range: string;
        total_tokens: number;
        input_tokens: number;
        output_tokens: number;
        cache_read_tokens: number;
        cache_creation_tokens: number;
        cache_read_rate: number;
        cache_write_rate: number;
        message_count: number;
        trend_pct: number;
    }>;
    getCosts(query: RangeQueryDto, req: AuthenticatedRequest): Promise<import("../services/agent-analytics.service").AgentCostsResult>;
}
export {};
