import { TenantContext } from '../../../common/decorators/tenant-context.decorator';
import { ProviderService } from '../../routing-core/provider.service';
import { ResolveAgentService } from '../../routing-core/resolve-agent.service';
import { CopilotDeviceAuthService } from './copilot-device-auth.service';
import { ModelDiscoveryService } from '../../../model-discovery/model-discovery.service';
import { AgentNameParamDto, CopilotPollDto } from '../../dto/routing.dto';
export declare class CopilotController {
    private readonly providerService;
    private readonly resolveAgentService;
    private readonly copilotAuth;
    private readonly discoveryService;
    constructor(providerService: ProviderService, resolveAgentService: ResolveAgentService, copilotAuth: CopilotDeviceAuthService, discoveryService: ModelDiscoveryService);
    copilotDeviceCode(ctx: TenantContext, params: AgentNameParamDto): Promise<import("./copilot-device-auth.service").DeviceCodeResponse>;
    copilotPollToken(ctx: TenantContext, params: AgentNameParamDto, body: CopilotPollDto): Promise<{
        status: import("./copilot-device-auth.service").PollStatus;
    }>;
}
