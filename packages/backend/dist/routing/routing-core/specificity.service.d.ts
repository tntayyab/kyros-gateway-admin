import { Repository } from 'typeorm';
import type { AuthType, ModelRoute, ResponseMode } from 'manifest-shared';
import { SpecificityAssignment } from '../../entities/specificity-assignment.entity';
import { ModelDiscoveryService } from '../../model-discovery/model-discovery.service';
import { RoutingCacheService } from './routing-cache.service';
export declare class SpecificityService {
    private readonly repo;
    private readonly routingCache;
    private readonly discoveryService;
    constructor(repo: Repository<SpecificityAssignment>, routingCache: RoutingCacheService, discoveryService: ModelDiscoveryService);
    getAssignments(agentId: string): Promise<SpecificityAssignment[]>;
    getActiveAssignments(agentId: string): Promise<SpecificityAssignment[]>;
    toggleCategory(agentId: string, category: string, active: boolean): Promise<SpecificityAssignment>;
    setOverride(agentId: string, tenantId: string, category: string, model: string, provider?: string, authType?: AuthType, providerKeyLabel?: string): Promise<SpecificityAssignment>;
    setResponseMode(agentId: string, category: string, responseMode: ResponseMode): Promise<SpecificityAssignment>;
    clearOverride(agentId: string, category: string): Promise<void>;
    setFallbacks(agentId: string, tenantId: string, category: string, models: string[], routes?: ModelRoute[]): Promise<ModelRoute[]>;
    clearFallbacks(agentId: string, category: string): Promise<void>;
    resetAll(agentId: string): Promise<void>;
    private buildFallbackRoutes;
}
