import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { TenantContext } from '../../../common/decorators/tenant-context.decorator';
import { ResolveAgentService } from '../../routing-core/resolve-agent.service';
import { ProviderKeyService } from '../../routing-core/provider-key.service';
import { ProviderService } from '../../routing-core/provider.service';
import { XaiOauthService } from './xai-oauth.service';
export declare class XaiOauthController {
    private readonly oauthService;
    private readonly resolveAgent;
    private readonly providerKeyService;
    private readonly providerService;
    private readonly configService;
    private readonly logger;
    constructor(oauthService: XaiOauthService, resolveAgent: ResolveAgentService, providerKeyService: ProviderKeyService, providerService: ProviderService, configService: ConfigService);
    authorize(agentName: string, ctx: TenantContext, req: Request): Promise<{
        url: string;
    }>;
    callback(code: string, state: string, _ctx: TenantContext): Promise<{
        ok: boolean;
    }>;
    revoke(agentName: string, label: string | string[] | undefined, ctx: TenantContext): Promise<{
        ok: boolean;
        notifications: string[];
    }>;
    done(ok: string, res: Response): void;
}
