import { ConfigService } from '@nestjs/config';
import { ProviderService } from '../../routing-core/provider.service';
import { ModelDiscoveryService } from '../../../model-discovery/model-discovery.service';
import { RedirectPkceOauthBaseService } from '../core/redirect-pkce-oauth.base';
export declare class XaiOauthService extends RedirectPkceOauthBaseService {
    constructor(providerService: ProviderService, configService: ConfigService, discoveryService: ModelDiscoveryService);
}
