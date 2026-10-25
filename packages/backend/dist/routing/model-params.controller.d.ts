import { type AuthType, type ProviderParamSpec, type RequestParamDefaults } from 'manifest-shared';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { AgentModelParamsService } from './routing-core/agent-model-params.service';
import { ProviderParamSpecService } from './routing-core/provider-param-spec.service';
import { ResolveAgentService } from './routing-core/resolve-agent.service';
import { AgentNameParamDto } from './dto/routing.dto';
import { DeleteModelParamsBodyDto, ModelParamSpecsQueryDto, SetModelParamsBodyDto } from './dto/model-params.dto';
export declare class ModelParamsController {
    private readonly modelParamsService;
    private readonly providerParamSpecs;
    private readonly resolveAgentService;
    constructor(modelParamsService: AgentModelParamsService, providerParamSpecs: ProviderParamSpecService, resolveAgentService: ResolveAgentService);
    specsByModel(ctx: TenantContext, params: AgentNameParamDto, query: ModelParamSpecsQueryDto): Promise<readonly ProviderParamSpec[]>;
    specsIndex(ctx: TenantContext, params: AgentNameParamDto): Promise<Array<{
        provider: string;
        authType: AuthType;
        model: string;
    }>>;
    list(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        provider: string;
        authType: "api_key" | "local" | "subscription";
        model: string;
        scope: string;
        params: RequestParamDefaults;
    }[]>;
    set(ctx: TenantContext, params: AgentNameParamDto, body: SetModelParamsBodyDto): Promise<{
        provider: string;
        authType: "api_key" | "local" | "subscription";
        model: string;
        scope: string;
        params: RequestParamDefaults;
    }>;
    remove(ctx: TenantContext, params: AgentNameParamDto, body: DeleteModelParamsBodyDto): Promise<{
        ok: boolean;
    }>;
    private assertCompatibleParams;
}
