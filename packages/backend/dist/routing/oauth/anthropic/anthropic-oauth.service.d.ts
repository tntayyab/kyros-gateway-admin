import { HttpStatus } from '@nestjs/common';
import { ProviderService } from '../../routing-core/provider.service';
import { ModelDiscoveryService } from '../../../model-discovery/model-discovery.service';
import { OAuthPendingFlowStore, type OAuthTokenBlob } from '../core';
export interface AuthorizeResult {
    url: string;
    state: string;
}
export declare class AnthropicOauthExchangeError extends Error {
    readonly status: HttpStatus;
    constructor(message: string, status: HttpStatus);
}
export declare function splitAnthropicAuthPayload(payload: string): {
    code: string;
    state?: string;
};
export declare class AnthropicOauthService {
    private readonly providerService;
    private readonly discoveryService;
    private readonly pendingFlows;
    private readonly logger;
    constructor(providerService: ProviderService, discoveryService: ModelDiscoveryService, pendingFlows: OAuthPendingFlowStore);
    generateAuthorizationUrl(agentId: string, tenantId: string): Promise<AuthorizeResult>;
    exchangeCode(payload: string, fallbackState: string | undefined, agentId: string, tenantId: string, createdByUserId?: string | null): Promise<void>;
    refreshAccessToken(refreshToken: string): Promise<OAuthTokenBlob>;
    unwrapToken(rawValue: string, agentId: string, tenantId: string, keyLabel?: string): Promise<string | null>;
    getPendingCount(): Promise<number>;
    clearPendingState(state: string): Promise<void>;
    findPendingForAgent(agentId: string, tenantId: string): Promise<{
        state: string;
    } | null>;
}
