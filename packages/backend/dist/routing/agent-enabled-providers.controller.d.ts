import { Repository } from 'typeorm';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { AgentEnabledProvider } from '../entities/agent-enabled-provider.entity';
import { Agent } from '../entities/agent.entity';
import { TenantProvider } from '../entities/tenant-provider.entity';
import { TierAssignment } from '../entities/tier-assignment.entity';
import { SpecificityAssignment } from '../entities/specificity-assignment.entity';
import { HeaderTier } from '../entities/header-tier.entity';
import { ProviderService } from './routing-core/provider.service';
export declare class AgentEnabledProvidersController {
    private readonly enabledProviderRepo;
    private readonly agentRepo;
    private readonly tenantProviderRepo;
    private readonly tierRepo;
    private readonly specificityRepo;
    private readonly headerTierRepo;
    private readonly providerService;
    constructor(enabledProviderRepo: Repository<AgentEnabledProvider>, agentRepo: Repository<Agent>, tenantProviderRepo: Repository<TenantProvider>, tierRepo: Repository<TierAssignment>, specificityRepo: Repository<SpecificityAssignment>, headerTierRepo: Repository<HeaderTier>, providerService: ProviderService);
    private resolveAgent;
    listEnabled(ctx: TenantContext, agentName: string): Promise<{
        enabled: string[];
    }>;
    getDisableImpact(ctx: TenantContext, agentName: string, tenantProviderId: string): Promise<{
        affected_tiers: {
            tier: string;
            model: string;
            position: string;
        }[];
    }>;
    private findAffectedRoutes;
    enable(ctx: TenantContext, agentName: string, tenantProviderId: string): Promise<{
        ok: boolean;
    }>;
    disable(ctx: TenantContext, agentName: string, tenantProviderId: string): Promise<{
        ok: boolean;
    }>;
}
