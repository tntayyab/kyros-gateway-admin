import { Repository } from 'typeorm';
import type { AuthType, ModelRoute, ResponseMode } from 'manifest-shared';
import { type TierColor } from 'manifest-shared';
import { HeaderTier } from '../../entities/header-tier.entity';
import { ModelDiscoveryService } from '../../model-discovery/model-discovery.service';
import { RoutingCacheService } from '../routing-core/routing-cache.service';
export declare const RESERVED_HEADER_KEYS: Set<string>;
export interface CreateHeaderTierInput {
    name: string;
    header_key: string;
    header_value: string;
    badge_color: TierColor;
}
export interface UpdateHeaderTierInput {
    name?: string;
    header_key?: string;
    header_value?: string;
    badge_color?: TierColor;
}
export declare class HeaderTierService {
    private readonly repo;
    private readonly routingCache;
    private readonly discoveryService;
    constructor(repo: Repository<HeaderTier>, routingCache: RoutingCacheService, discoveryService: ModelDiscoveryService);
    list(agentId: string): Promise<HeaderTier[]>;
    create(agentId: string, tenantId: string, input: CreateHeaderTierInput): Promise<HeaderTier>;
    update(agentId: string, id: string, patch: UpdateHeaderTierInput): Promise<HeaderTier>;
    setEnabled(agentId: string, id: string, enabled: boolean): Promise<HeaderTier>;
    setResponseMode(agentId: string, id: string, responseMode: ResponseMode): Promise<HeaderTier>;
    delete(agentId: string, id: string): Promise<void>;
    reorder(agentId: string, ids: string[]): Promise<void>;
    setOverride(agentId: string, tenantId: string, id: string, model: string, provider?: string, authType?: AuthType, providerKeyLabel?: string | null): Promise<HeaderTier>;
    clearOverride(agentId: string, id: string): Promise<void>;
    setFallbacks(agentId: string, tenantId: string, id: string, models: string[], routes?: ModelRoute[]): Promise<ModelRoute[]>;
    clearFallbacks(agentId: string, id: string): Promise<void>;
    private buildFallbackRoutes;
    private findOrThrow;
    private validateName;
    private validateHeaderKey;
    private validateHeaderValue;
    private validateColor;
    private assertNameAvailable;
    private assertRuleAvailable;
}
