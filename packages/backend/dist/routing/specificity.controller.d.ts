import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { SpecificityService } from './routing-core/specificity.service';
import { ResolveAgentService } from './routing-core/resolve-agent.service';
import { AgentNameParamDto, SetFallbacksDto, SetResponseModeDto } from './dto/routing.dto';
import { SetSpecificityOverrideDto, ToggleSpecificityDto } from './dto/specificity.dto';
export declare class SpecificityController {
    private readonly specificityService;
    private readonly resolveAgentService;
    constructor(specificityService: SpecificityService, resolveAgentService: ResolveAgentService);
    getAssignments(ctx: TenantContext, params: AgentNameParamDto): Promise<import("../entities/specificity-assignment.entity").SpecificityAssignment[]>;
    setOverride(ctx: TenantContext, agentName: string, category: string, body: SetSpecificityOverrideDto): Promise<import("../entities/specificity-assignment.entity").SpecificityAssignment>;
    toggleCategory(ctx: TenantContext, agentName: string, category: string, body: ToggleSpecificityDto): Promise<import("../entities/specificity-assignment.entity").SpecificityAssignment>;
    clearOverride(ctx: TenantContext, agentName: string, category: string): Promise<{
        ok: boolean;
    }>;
    setResponseMode(ctx: TenantContext, agentName: string, category: string, body: SetResponseModeDto): Promise<import("../entities/specificity-assignment.entity").SpecificityAssignment>;
    setFallbacks(ctx: TenantContext, agentName: string, category: string, body: SetFallbacksDto): Promise<import("manifest-shared").ModelRoute[]>;
    clearFallbacks(ctx: TenantContext, agentName: string, category: string): Promise<{
        ok: boolean;
    }>;
    resetAll(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        ok: boolean;
    }>;
    private validateCategory;
}
