import { Repository } from 'typeorm';
import { type AuthType } from 'manifest-shared';
import { TenantProvider } from '../entities/tenant-provider.entity';
import { AgentEnabledProvider } from '../entities/agent-enabled-provider.entity';
import { CustomProvider } from '../entities/custom-provider.entity';
import { ProviderModelFetcherService } from './provider-model-fetcher.service';
import { ProviderModelRegistryService } from './provider-model-registry.service';
import { DiscoveredModel } from './model-fetcher';
import { PricingSyncService } from '../database/pricing-sync.service';
import { ModelsDevSyncService } from '../database/models-dev-sync.service';
import { CopilotTokenService } from '../routing/proxy/copilot-token.service';
interface DiscoverModelsOptions {
    forceRefresh?: boolean;
    skipModelsDevRefresh?: boolean;
}
export declare class ModelDiscoveryService {
    private readonly providerRepo;
    private readonly customProviderRepo;
    private readonly fetcher;
    private readonly pricingSync;
    private readonly modelsDevSync;
    private readonly modelRegistry;
    private readonly copilotTokenService;
    private readonly enabledProviderRepo;
    private readonly logger;
    private readonly modelsCache;
    constructor(providerRepo: Repository<TenantProvider>, customProviderRepo: Repository<CustomProvider>, fetcher: ProviderModelFetcherService, pricingSync: PricingSyncService | null, modelsDevSync: ModelsDevSyncService | null, modelRegistry: ProviderModelRegistryService | null, copilotTokenService: CopilotTokenService | null, enabledProviderRepo?: Repository<AgentEnabledProvider> | null);
    discoverModels(provider: TenantProvider, options?: DiscoverModelsOptions): Promise<DiscoveredModel[]>;
    discoverAllForAgent(tenantId: string, options?: DiscoverModelsOptions): Promise<void>;
    private refreshModelsDevCache;
    refreshProvider(tenantId: string, providerId: string, authType?: AuthType): Promise<{
        ok: boolean;
        model_count: number;
        last_fetched_at: string | null;
        error: string | null;
    }>;
    getModelsForAgent(tenantId: string, agentId?: string): Promise<DiscoveredModel[]>;
    invalidate(agentId: string): void;
    invalidateTenant(tenantId: string): void;
    private invalidateProviderAccess;
    private fetchModelsForAgent;
    private filterProvidersForAgent;
    getModelForAgent(tenantId: string, modelName: string, agentId?: string): Promise<DiscoveredModel | undefined>;
    private enrichModel;
    private enrichFromCatalogs;
    private applyCapabilities;
    private computeScore;
}
export {};
