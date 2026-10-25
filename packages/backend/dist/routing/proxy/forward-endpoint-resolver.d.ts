import type { Logger } from '@nestjs/common';
import { type ProviderEndpoint } from './provider-endpoints';
export interface CustomProviderEndpointConfig {
    base_url: string;
    api_kind?: 'openai' | 'anthropic' | null;
}
export interface ResolveForwardEndpointParams {
    provider: string;
    authType: string | undefined;
    model: string;
    providerRegion?: string | null;
    resourceUrl?: string;
    customProvider?: CustomProviderEndpointConfig | null;
    logger?: Pick<Logger, 'warn'>;
    apiMode?: string;
}
export interface ResolvedForwardEndpoint {
    customEndpoint?: ProviderEndpoint;
    forwardModel: string;
}
export declare function resolveForwardEndpoint(params: ResolveForwardEndpointParams): ResolvedForwardEndpoint;
