import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { CustomProviderService } from './custom-provider.service';
import { ProviderService } from '../routing-core/provider.service';
import { ResolveAgentService } from '../routing-core/resolve-agent.service';
import { CreateCustomProviderDto, ProbeCustomProviderDto, UpdateCustomProviderDto } from '../dto/custom-provider.dto';
import { AgentNameParamDto } from '../dto/routing.dto';
export declare class CustomProviderController {
    private readonly customProviderService;
    private readonly providerService;
    private readonly resolveAgentService;
    constructor(customProviderService: CustomProviderService, providerService: ProviderService, resolveAgentService: ResolveAgentService);
    list(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        id: string;
        name: string;
        alias: string | null;
        base_url: string;
        api_kind: import("../../entities/custom-provider.entity").CustomProviderApiKind;
        has_api_key: boolean;
        models: import("../../entities/custom-provider.entity").CustomProviderModel[];
        created_at: string;
    }[]>;
    probe(ctx: TenantContext, agentName: string, body: ProbeCustomProviderDto): Promise<{
        models: import("../../entities/custom-provider.entity").CustomProviderModel[];
    }>;
    create(ctx: TenantContext, params: AgentNameParamDto, body: CreateCustomProviderDto): Promise<{
        id: string;
        name: string;
        alias: string | null;
        base_url: string;
        api_kind: import("../../entities/custom-provider.entity").CustomProviderApiKind;
        has_api_key: boolean;
        models: import("../../entities/custom-provider.entity").CustomProviderModel[];
        created_at: string;
    }>;
    update(ctx: TenantContext, agentName: string, id: string, body: UpdateCustomProviderDto): Promise<{
        id: string;
        name: string;
        alias: string | null;
        base_url: string;
        api_kind: import("../../entities/custom-provider.entity").CustomProviderApiKind;
        has_api_key: boolean;
        models: import("../../entities/custom-provider.entity").CustomProviderModel[];
        created_at: string;
    }>;
    remove(ctx: TenantContext, agentName: string, id: string): Promise<{
        ok: boolean;
    }>;
}
