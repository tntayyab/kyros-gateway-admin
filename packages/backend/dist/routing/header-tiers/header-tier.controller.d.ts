import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { ResolveAgentService } from '../routing-core/resolve-agent.service';
import { ModelRouteDto, SetResponseModeDto } from '../dto/routing.dto';
import { HeaderTierService } from './header-tier.service';
import { type TierColor } from 'manifest-shared';
interface CreateHeaderTierBody {
    name: string;
    header_key: string;
    header_value: string;
    badge_color: TierColor;
}
interface UpdateHeaderTierBody {
    name?: string;
    header_key?: string;
    header_value?: string;
    badge_color?: TierColor;
}
interface ReorderBody {
    ids: string[];
}
export declare class OverrideBody {
    model: string;
    provider?: string;
    authType?: 'api_key' | 'subscription' | 'local';
    providerKeyLabel?: string;
    route?: ModelRouteDto;
}
export declare class FallbacksBody {
    models: string[];
    routes?: ModelRouteDto[];
}
export declare class HeaderTierController {
    private readonly headerTierService;
    private readonly resolveAgentService;
    constructor(headerTierService: HeaderTierService, resolveAgentService: ResolveAgentService);
    list(ctx: TenantContext, agentName: string): Promise<import("../../entities/header-tier.entity").HeaderTier[]>;
    create(ctx: TenantContext, agentName: string, body: CreateHeaderTierBody): Promise<import("../../entities/header-tier.entity").HeaderTier>;
    update(ctx: TenantContext, agentName: string, id: string, body: UpdateHeaderTierBody): Promise<import("../../entities/header-tier.entity").HeaderTier>;
    toggle(ctx: TenantContext, agentName: string, id: string, body: {
        enabled: boolean;
    }): Promise<import("../../entities/header-tier.entity").HeaderTier>;
    setResponseMode(ctx: TenantContext, agentName: string, id: string, body: SetResponseModeDto): Promise<import("../../entities/header-tier.entity").HeaderTier>;
    delete(ctx: TenantContext, agentName: string, id: string): Promise<{
        ok: boolean;
    }>;
    reorder(ctx: TenantContext, agentName: string, body: ReorderBody): Promise<{
        ok: boolean;
    }>;
    setOverride(ctx: TenantContext, agentName: string, id: string, body: OverrideBody): Promise<import("../../entities/header-tier.entity").HeaderTier>;
    clearOverride(ctx: TenantContext, agentName: string, id: string): Promise<{
        ok: boolean;
    }>;
    setFallbacks(ctx: TenantContext, agentName: string, id: string, body: FallbacksBody): Promise<import("manifest-shared").ModelRoute[]>;
    clearFallbacks(ctx: TenantContext, agentName: string, id: string): Promise<{
        ok: boolean;
    }>;
}
export {};
