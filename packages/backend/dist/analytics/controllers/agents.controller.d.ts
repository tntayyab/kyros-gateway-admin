import type { Cache } from 'cache-manager';
import { TimeseriesQueriesService } from '../services/timeseries-queries.service';
import { AgentLifecycleService } from '../services/agent-lifecycle.service';
import { AgentDuplicationService } from '../services/agent-duplication.service';
import { ApiKeyGeneratorService } from '../../otlp/services/api-key.service';
import { IngestEventBusService } from '../../common/services/ingest-event-bus.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { CreateAgentDto } from '../../common/dto/create-agent.dto';
import { DuplicateAgentDto } from '../../common/dto/duplicate-agent.dto';
import { RenameAgentDto } from '../../common/dto/rename-agent.dto';
import { AgentListCacheService } from '../../common/services/agent-list-cache.service';
import { ProviderService } from '../../routing/routing-core/provider.service';
import { AutofixStatsService } from '../services/autofix-stats.service';
export declare class AgentsController {
    private readonly timeseries;
    private readonly lifecycle;
    private readonly duplication;
    private readonly apiKeyGenerator;
    private readonly eventBus;
    private readonly providerService;
    private readonly autofixStats;
    private readonly agentListCache;
    private readonly cacheManager;
    private readonly logger;
    constructor(timeseries: TimeseriesQueriesService, lifecycle: AgentLifecycleService, duplication: AgentDuplicationService, apiKeyGenerator: ApiKeyGeneratorService, eventBus: IngestEventBusService, providerService: ProviderService, autofixStats: AutofixStatsService, agentListCache: AgentListCacheService, cacheManager: Cache);
    private invalidateAgentListCache;
    private invalidateAutofixStatusCache;
    private emitAgentEvent;
    getAgents(ctx: TenantContext, includePlayground?: string): Promise<{
        agents: {
            agent_name: string;
            display_name: string;
            agent_category: string | null;
            agent_platform: string | null;
            message_count: number;
            last_active: string;
            total_cost: number;
            total_tokens: number;
            sparkline: number[];
        }[];
    }>;
    createAgent(ctx: TenantContext, body: CreateAgentDto): Promise<{
        agent: {
            id: string;
            name: string;
            display_name: string;
            agent_category: string | null;
            agent_platform: string | null;
        };
        apiKey: string;
    }>;
    getDuplicatePreview(ctx: TenantContext, agentName: string): Promise<{
        copied: import("../services/agent-duplication.service").DuplicateAgentSummary;
        suggested_name: string;
    }>;
    duplicateAgent(ctx: TenantContext, sourceName: string, body: DuplicateAgentDto): Promise<{
        agent: {
            id: string;
            name: string;
            display_name: string;
        };
        apiKey: string;
        copied: import("../services/agent-duplication.service").DuplicateAgentSummary;
    }>;
    getAgentInfo(ctx: TenantContext, agentName: string): Promise<{
        agent: null;
    } | {
        agent: {
            agent_name: string;
            display_name: string;
            agent_category: string | null;
            agent_platform: string | null;
        };
    }>;
    getAgentKey(ctx: TenantContext, agentName: string): Promise<{
        apiKey?: string | undefined;
        keyPrefix: string;
    }>;
    rotateAgentKey(ctx: TenantContext, agentName: string): Promise<{
        apiKey: string;
    }>;
    updateAgent(ctx: TenantContext, agentName: string, body: RenameAgentDto): Promise<Record<string, unknown>>;
    deleteAgent(ctx: TenantContext, agentName: string): Promise<{
        deleted: boolean;
    }>;
}
