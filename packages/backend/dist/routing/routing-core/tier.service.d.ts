import { Repository } from 'typeorm';
import { TierAssignment } from '../../entities/tier-assignment.entity';
import { RoutingCacheService } from './routing-cache.service';
import { ProviderService } from './provider.service';
import { ModelDiscoveryService } from '../../model-discovery/model-discovery.service';
import type { AuthType, ModelRoute, ResponseMode } from 'manifest-shared';
export declare class TierService {
    private readonly tierRepo;
    private readonly routingCache;
    private readonly providerService;
    private readonly discoveryService;
    constructor(tierRepo: Repository<TierAssignment>, routingCache: RoutingCacheService, providerService: ProviderService, discoveryService: ModelDiscoveryService);
    hasRoutableTier(agentId: string): Promise<boolean>;
    getTiers(agentId: string, tenantId?: string): Promise<TierAssignment[]>;
    setOverride(agentId: string, tenantId: string, tier: string, model: string, provider?: string, authType?: AuthType, providerKeyLabel?: string): Promise<TierAssignment>;
    setResponseMode(agentId: string, tier: string, responseMode: ResponseMode): Promise<TierAssignment>;
    clearOverride(agentId: string, tier: string): Promise<void>;
    resetAllOverrides(agentId: string): Promise<void>;
    getFallbacks(agentId: string, tier: string): Promise<ModelRoute[]>;
    setFallbacks(agentId: string, tenantId: string, tier: string, models: string[], routes?: ModelRoute[]): Promise<ModelRoute[]>;
    clearFallbacks(agentId: string, tier: string): Promise<void>;
    private buildFallbackRoutes;
}
