import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { ResolveAgentService } from '../routing-core/resolve-agent.service';
import { TierModelParamsPathDto, TierModelParamsQueryDto, UpdateTierModelParamsBodyDto } from '../dto/model-params.dto';
import { RouteModelParamsService, type RouteModelParamsView } from './route-model-params.service';
export declare class RouteModelParamsController {
    private readonly routeParams;
    private readonly resolveAgentService;
    constructor(routeParams: RouteModelParamsService, resolveAgentService: ResolveAgentService);
    get(ctx: TenantContext, params: TierModelParamsPathDto, query: TierModelParamsQueryDto): Promise<RouteModelParamsView>;
    update(ctx: TenantContext, params: TierModelParamsPathDto, query: TierModelParamsQueryDto, body: UpdateTierModelParamsBodyDto): Promise<RouteModelParamsView>;
}
