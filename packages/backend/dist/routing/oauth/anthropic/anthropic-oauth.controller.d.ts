import { TenantContext } from '../../../common/decorators/tenant-context.decorator';
import { ResolveAgentService } from '../../routing-core/resolve-agent.service';
import { ProviderService } from '../../routing-core/provider.service';
import { AnthropicOauthService } from './anthropic-oauth.service';
export declare class AnthropicOauthController {
    private readonly oauthService;
    private readonly resolveAgent;
    private readonly providerService;
    private readonly logger;
    constructor(oauthService: AnthropicOauthService, resolveAgent: ResolveAgentService, providerService: ProviderService);
    authorize(agentName: string, ctx: TenantContext): Promise<import("./anthropic-oauth.service").AuthorizeResult>;
    exchange(agentName: string, code: string, state: string, ctx: TenantContext): Promise<{
        ok: boolean;
    }>;
    pending(agentName: string, ctx: TenantContext): Promise<{
        state: string;
    } | {
        state: null;
    }>;
    revoke(agentName: string, label: string | string[] | undefined, ctx: TenantContext): Promise<{
        ok: boolean;
        notifications: string[];
    }>;
}
