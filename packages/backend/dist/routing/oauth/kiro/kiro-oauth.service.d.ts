import { ConfigService } from '@nestjs/config';
import { ProviderService } from '../../routing-core/provider.service';
import { ModelDiscoveryService } from '../../../model-discovery/model-discovery.service';
import { KiroAuthorizationOptions } from './kiro-oidc';
export interface KiroOAuthStartResult {
    flowId: string;
    userCode: string;
    verificationUri: string;
    expiresAt: number;
    pollIntervalMs: number;
}
export interface KiroOAuthPollResult {
    status: 'pending' | 'success' | 'error';
    message?: string;
    pollIntervalMs?: number;
}
export declare class KiroOauthService {
    private readonly providerService;
    private readonly configService;
    private readonly discoveryService;
    private readonly logger;
    private readonly pending;
    private readonly region;
    private readonly startUrl;
    private readonly scopes;
    constructor(providerService: ProviderService, configService: ConfigService, discoveryService: ModelDiscoveryService);
    startAuthorization(agentId: string, tenantId: string, createdByUserId?: string | null, options?: KiroAuthorizationOptions): Promise<KiroOAuthStartResult>;
    pollAuthorization(flowId: string, tenantId: string): Promise<KiroOAuthPollResult>;
    unwrapToken(rawValue: string, agentId: string, tenantId: string, keyLabel?: string): Promise<string | null>;
    getPendingCount(): number;
    private registerClient;
    private startDeviceAuthorization;
    private resolveAuthorizationOptions;
    private refreshAccessToken;
    private cleanupExpired;
    private parseJson;
}
