import { ConfigService } from '@nestjs/config';
import { ProviderService } from '../../routing-core/provider.service';
import { ModelDiscoveryService } from '../../../model-discovery/model-discovery.service';
import { OAuthTokenBlob } from '../core';
import { RedirectPkceOauthBaseService } from '../core/redirect-pkce-oauth.base';
import { CodeAssistClientService } from './codeassist-client.service';
export declare class GeminiOauthService extends RedirectPkceOauthBaseService {
    private readonly codeAssist;
    constructor(providerService: ProviderService, configService: ConfigService, discoveryService: ModelDiscoveryService, codeAssist: CodeAssistClientService);
    protected enrichBlob(blob: OAuthTokenBlob): Promise<OAuthTokenBlob>;
}
