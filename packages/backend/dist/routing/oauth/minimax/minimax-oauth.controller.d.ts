import { TenantContext } from '../../../common/decorators/tenant-context.decorator';
import { MinimaxOauthService } from './minimax-oauth.service';
import { ResolveAgentService } from '../../routing-core/resolve-agent.service';
import { ProviderService } from '../../routing-core/provider.service';
export declare class MinimaxOauthController {
    private readonly oauthService;
    private readonly resolveAgent;
    private readonly providerService;
    constructor(oauthService: MinimaxOauthService, resolveAgent: ResolveAgentService, providerService: ProviderService);
    start(agentName: string, region: string | undefined, ctx: TenantContext): Promise<import("./minimax-oauth.service").MinimaxOAuthStartResult>;
    poll(flowId: string, ctx: TenantContext): Promise<import("./minimax-oauth.service").MinimaxOAuthPollResult>;
    revoke(agentName: string, label: string | string[] | undefined, ctx: TenantContext): Promise<{
        ok: boolean;
        notifications: string[];
    }>;
}
