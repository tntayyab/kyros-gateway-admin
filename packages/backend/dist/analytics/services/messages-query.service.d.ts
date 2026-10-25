import { AnalyticsScopeService, type AgentScope } from './analytics-scope.service';
import { DataSource, Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import { CustomProvider } from '../../entities/custom-provider.entity';
import { TenantProvider } from '../../entities/tenant-provider.entity';
import type { MessageOriginFilter, MessageStatusFilter, MessageTriggerFilter } from '../dto/messages-query.dto';
import { ManifestRequest } from '../../entities/request.entity';
import { HeaderTier } from '../../entities/header-tier.entity';
interface MessageFilterParams {
    range?: string;
    tenantId: string | null;
    agent_name?: string;
    agentScope?: AgentScope;
}
interface MessageQueryParams extends MessageFilterParams {
    provider?: string;
    connections?: string[];
    models?: string[];
    service_type?: string;
    cost_min?: number;
    cost_max?: number;
    limit: number;
    cursor?: string;
    status?: MessageStatusFilter;
    attemptStatus?: ('has_failed' | 'has_succeeded')[];
    triggers?: MessageTriggerFilter[];
    origin?: MessageOriginFilter;
    error_class?: string;
    routing_tier?: string;
    specificity_category?: string;
    header_tier_id?: string;
    include_total?: boolean;
    cache_total?: boolean;
    include_filter_options?: boolean;
    exclude_playground?: boolean;
    exclude_direct?: boolean;
}
export interface HeaderTierFilterOption {
    name: string;
    ids: string[];
}
export declare class MessagesQueryService {
    private readonly analyticsScope;
    private readonly turnRepo;
    private readonly customProviderRepo;
    private readonly requestRepo?;
    private readonly tenantProviderRepo?;
    private readonly dataSource?;
    private readonly headerTierRepo?;
    private readonly modelsCache;
    private readonly attemptlessModelsCache;
    private readonly countCache;
    constructor(analyticsScope: AnalyticsScopeService, turnRepo: Repository<AgentMessage>, customProviderRepo: Repository<CustomProvider>, requestRepo?: Repository<ManifestRequest> | undefined, tenantProviderRepo?: Repository<TenantProvider> | undefined, dataSource?: DataSource | undefined, headerTierRepo?: Repository<HeaderTier> | undefined);
    getMessages(params: MessageQueryParams): Promise<{
        items: any[];
        next_cursor: string | null;
        total_count: number;
        total_count_exact: boolean;
        providers: string[];
        provider_labels: Record<string, string>;
        header_tiers: HeaderTierFilterOption[];
        models: string[];
    }>;
    private getRequests;
    private resolveConnections;
    private withCompatibilitySnapshot;
    getMessageFilterOptions(params: MessageFilterParams): Promise<{
        providers: string[];
        provider_labels: Record<string, string>;
        header_tiers: HeaderTierFilterOption[];
        models: string[];
    }>;
    private getHeaderTierOptions;
    private resolveCustomProviderLabels;
    private buildBaseMessageQuery;
    private applyTriggerFilter;
    private applyProviderFilter;
    private applyCursor;
    private encodeCursor;
    private cacheAndReturnCount;
    private deriveProviders;
    private getAttemptlessRequestedModels;
    private getDistinctModels;
    private getDistinctModelsViaSkipScan;
    private getDistinctModelsViaScan;
    private buildCountCacheKey;
}
export {};
