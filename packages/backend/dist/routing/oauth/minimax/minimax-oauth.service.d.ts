import { ConfigService } from '@nestjs/config';
import { ProviderService } from '../../routing-core/provider.service';
import { ModelDiscoveryService } from '../../../model-discovery/model-discovery.service';
import { type OAuthTokenBlob } from '../core';
import { MinimaxRegion } from './minimax-oauth-helpers';
export type { MinimaxRegion };
export interface MinimaxOAuthStartResult {
    flowId: string;
    userCode: string;
    verificationUri: string;
    expiresAt: number;
    pollIntervalMs: number;
}
export interface MinimaxOAuthPollResult {
    status: 'pending' | 'success' | 'error';
    message?: string;
    pollIntervalMs?: number;
}
export declare class MinimaxOauthService {
    private readonly providerService;
    private readonly configService;
    private readonly discoveryService;
    private readonly logger;
    private readonly pending;
    private readonly clientId;
    constructor(providerService: ProviderService, configService: ConfigService, discoveryService: ModelDiscoveryService);
    startAuthorization(agentId: string, tenantId: string, region?: MinimaxRegion, createdByUserId?: string | null): Promise<MinimaxOAuthStartResult>;
    pollAuthorization(flowId: string, tenantId: string): Promise<MinimaxOAuthPollResult>;
    refreshAccessToken(refreshToken: string, resourceUrl?: string): Promise<OAuthTokenBlob>;
    unwrapToken(rawValue: string, agentId: string, tenantId: string, keyLabel?: string): Promise<OAuthTokenBlob | null>;
    getPendingCount(): number;
    private cleanupExpired;
    private parseTokenResponse;
}
export { DEFAULT_RESOURCE_URL as MINIMAX_DEFAULT_RESOURCE_URL } from './minimax-oauth-helpers';
export { isMinimaxRegion } from './minimax-oauth-helpers';
