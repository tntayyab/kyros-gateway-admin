import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { TierService } from './routing-core/tier.service';
import { ResolveAgentService } from './routing-core/resolve-agent.service';
import { AgentNameParamDto, SetOverrideDto, SetFallbacksDto, SetResponseModeDto, UpdateAutofixDto, UpdateRecordingDto } from './dto/routing.dto';
import { Agent } from '../entities/agent.entity';
import { InstallMetadata } from '../entities/install-metadata.entity';
import { AutofixService } from './autofix/autofix.service';
import { AgentRecordingConfigService } from '../common/services/agent-recording-config.service';
export declare class TierController {
    private readonly tierService;
    private readonly resolveAgentService;
    private readonly agentRepo;
    private readonly installMetadataRepo;
    private readonly autofixService;
    private readonly recordingConfig;
    private readonly cacheManager;
    constructor(tierService: TierService, resolveAgentService: ResolveAgentService, agentRepo: Repository<Agent>, installMetadataRepo: Repository<InstallMetadata>, autofixService: AutofixService, recordingConfig: AgentRecordingConfigService, cacheManager: Cache);
    getTiers(ctx: TenantContext, params: AgentNameParamDto): Promise<import("../entities/tier-assignment.entity").TierAssignment[]>;
    setOverride(ctx: TenantContext, agentName: string, tier: string, body: SetOverrideDto): Promise<import("../entities/tier-assignment.entity").TierAssignment>;
    clearOverride(ctx: TenantContext, agentName: string, tier: string): Promise<{
        ok: boolean;
    }>;
    setResponseMode(ctx: TenantContext, agentName: string, tier: string, body: SetResponseModeDto): Promise<import("../entities/tier-assignment.entity").TierAssignment>;
    resetAllOverrides(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        ok: boolean;
    }>;
    getFallbacks(ctx: TenantContext, agentName: string, tier: string): Promise<import("manifest-shared").ModelRoute[]>;
    setFallbacks(ctx: TenantContext, agentName: string, tier: string, body: SetFallbacksDto): Promise<import("manifest-shared").ModelRoute[]>;
    clearFallbacks(ctx: TenantContext, agentName: string, tier: string): Promise<{
        ok: boolean;
    }>;
    getComplexityStatus(ctx: TenantContext, agentName: string): Promise<{
        enabled: boolean;
    }>;
    toggleComplexity(ctx: TenantContext, agentName: string): Promise<{
        enabled: boolean;
    }>;
    getAutofix(ctx: TenantContext, agentName: string): Promise<{
        enabled: boolean;
        consented: boolean;
    }>;
    updateAutofix(ctx: TenantContext, agentName: string, body: UpdateAutofixDto): Promise<{
        enabled: boolean;
        consented: boolean;
    }>;
    private hasAutofixConsent;
    private recordAutofixConsent;
    getRecording(ctx: TenantContext, agentName: string): Promise<{
        enabled: boolean;
    }>;
    updateRecording(ctx: TenantContext, agentName: string, body: UpdateRecordingDto): Promise<{
        enabled: boolean;
    }>;
    private validateTier;
}
