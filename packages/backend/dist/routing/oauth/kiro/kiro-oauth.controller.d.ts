import { TenantContext } from '../../../common/decorators/tenant-context.decorator';
import { KiroOauthService } from './kiro-oauth.service';
import { ResolveAgentService } from '../../routing-core/resolve-agent.service';
import { ProviderService } from '../../routing-core/provider.service';
export declare class KiroOauthController {
    private readonly oauthService;
    private readonly resolveAgent;
    private readonly providerService;
    constructor(oauthService: KiroOauthService, resolveAgent: ResolveAgentService, providerService: ProviderService);
    start(agentName: string, ctx: TenantContext, startUrl?: string | string[], region?: string | string[]): Promise<import("./kiro-oauth.service").KiroOAuthStartResult>;
    poll(flowId: string, ctx: TenantContext): Promise<import("./kiro-oauth.service").KiroOAuthPollResult>;
    revoke(agentName: string, label: string | string[] | undefined, ctx: TenantContext): Promise<{
        ok: boolean;
        notifications: string[];
    }>;
}
