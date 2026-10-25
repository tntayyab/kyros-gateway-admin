import { ConfigService } from '@nestjs/config';
import { ProviderService } from '../../routing-core/provider.service';
import { ModelDiscoveryService } from '../../../model-discovery/model-discovery.service';
import { PendingOAuth } from './openai-oauth.types';
import { oauthDoneHtml, type OAuthTokenBlob } from '../core';
import { RedirectPkceOauthBaseService } from '../core/redirect-pkce-oauth.base';
export { PendingOAuth };
export { oauthDoneHtml, type OAuthTokenBlob };
export declare class OpenaiOauthService extends RedirectPkceOauthBaseService {
    constructor(providerService: ProviderService, configService: ConfigService, discoveryService: ModelDiscoveryService);
}
