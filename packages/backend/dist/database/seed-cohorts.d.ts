import { DataSource, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Tenant } from '../entities/tenant.entity';
import { Agent } from '../entities/agent.entity';
import { AgentApiKey } from '../entities/agent-api-key.entity';
import { TenantProvider } from '../entities/tenant-provider.entity';
import { AgentEnabledProvider } from '../entities/agent-enabled-provider.entity';
import { TierAssignment } from '../entities/tier-assignment.entity';
import { SpecificityAssignment } from '../entities/specificity-assignment.entity';
export declare const COHORT_SEED: {
    readonly oldUserEmail: "olduser@manifest.build";
    readonly oldUserPassword: "manifest";
    readonly oldTenantId: "seed-tenant-old-001";
    readonly oldAgentId: "seed-agent-old-001";
    readonly oldOtlpKey: "mnfst_dev-otlp-key-old-001";
};
export interface CohortSeedDeps {
    dataSource: DataSource;
    tenantRepo: Repository<Tenant>;
    agentRepo: Repository<Agent>;
    agentKeyRepo: Repository<AgentApiKey>;
    providerRepo: Repository<TenantProvider>;
    enabledProviderRepo: Repository<AgentEnabledProvider>;
    tierRepo: Repository<TierAssignment>;
    specificityRepo: Repository<SpecificityAssignment>;
    logger: Logger;
    cleanAgentId: string;
}
export declare function seedRoutingCohorts(deps: CohortSeedDeps): Promise<void>;
