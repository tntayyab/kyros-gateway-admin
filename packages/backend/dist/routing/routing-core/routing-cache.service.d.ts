import { TenantProvider } from '../../entities/tenant-provider.entity';
import { TierAssignment } from '../../entities/tier-assignment.entity';
import { CustomProvider } from '../../entities/custom-provider.entity';
import { SpecificityAssignment } from '../../entities/specificity-assignment.entity';
import { HeaderTier } from '../../entities/header-tier.entity';
import { AgentModelParams } from '../../entities/agent-model-params.entity';
export interface CachedProviderKey {
    id: string;
    label: string;
    priority: number;
    apiKey: string | null;
    region: string | null;
}
export type AgentInvalidationListener = (agentId: string) => void;
export type TenantInvalidationListener = (tenantId: string) => void;
export declare class RoutingCacheService {
    private readonly tiers;
    private readonly providers;
    private readonly customProviders;
    private readonly providerKeys;
    private readonly specificity;
    private readonly headerTiers;
    private readonly modelParams;
    private readonly invalidationListeners;
    private readonly tenantInvalidationListeners;
    getTiers(agentId: string): TierAssignment[] | null;
    setTiers(agentId: string, data: TierAssignment[]): void;
    getProviders(tenantId: string): TenantProvider[] | null;
    setProviders(tenantId: string, data: TenantProvider[]): void;
    getCustomProviders(tenantId: string): CustomProvider[] | null;
    setCustomProviders(tenantId: string, data: CustomProvider[]): void;
    private providerKeysKey;
    getProviderKeys(tenantId: string, provider: string, authType?: string, agentId?: string): CachedProviderKey[] | undefined;
    setProviderKeys(tenantId: string, provider: string, keys: CachedProviderKey[], authType?: string, agentId?: string): void;
    getSpecificity(agentId: string): SpecificityAssignment[] | null;
    setSpecificity(agentId: string, data: SpecificityAssignment[]): void;
    getHeaderTiers(agentId: string): HeaderTier[] | null;
    setHeaderTiers(agentId: string, data: HeaderTier[]): void;
    getModelParams(agentId: string): AgentModelParams[] | null;
    setModelParams(agentId: string, data: AgentModelParams[]): void;
    invalidateModelParams(agentId: string): void;
    addInvalidationListener(listener: AgentInvalidationListener): void;
    addTenantInvalidationListener(listener: TenantInvalidationListener): void;
    invalidateAgent(agentId: string): void;
    invalidateTenant(tenantId: string): void;
}
