import type { AuthType } from 'manifest-shared';
import { ProviderKeyService } from '../routing-core/provider-key.service';
import { type ManifestErrorCode } from '../../common/errors/error-codes';
import type { ManifestBlockedRequestReason } from '../../common/errors/manifest-error';
import { type OAuthServiceSet } from './oauth-credentials';
import type { ForwardResult } from './provider-client';
import type { ProviderAttemptRef, StartProviderAttempt } from './proxy-types';
export type CredentialFailureReason = Extract<ManifestBlockedRequestReason, 'no_provider_key' | 'subscription_credentials_unusable'>;
export declare const CREDENTIAL_FAILURE_HTTP_STATUS = 401;
export type ResolvedRouteCredentials = {
    ok: true;
    apiKey: string;
    rawApiKey: string;
    resourceUrl?: string;
    providerRegion?: string | null;
    tenantProviderId: string | null;
    keyLabel: string;
} | {
    ok: false;
    reason: CredentialFailureReason;
    tenantProviderId: string | null;
};
export interface CredentialFailurePresentation {
    code: Extract<ManifestErrorCode, 'M100' | 'M102'>;
    reason: CredentialFailureReason;
    message: string;
    status: typeof CREDENTIAL_FAILURE_HTTP_STATUS;
    errorBody: string;
}
export interface RouteCredentialDeps {
    providerKeyService: Pick<ProviderKeyService, 'selectProviderKey' | 'getProviderApiKey'>;
    oauth: OAuthServiceSet;
}
export declare function credentialFailureCode(reason: CredentialFailureReason): Extract<ManifestErrorCode, 'M100' | 'M102'>;
export declare function presentCredentialFailure(reason: CredentialFailureReason, provider: string, dashboardUrl: string): CredentialFailurePresentation;
export declare function startCredentialFailureAttempt(startProviderAttempt: StartProviderAttempt | undefined, start: {
    provider: string;
    model: string;
    authType?: string;
    tenantProviderId?: string | null;
    keyLabel?: string;
}): ProviderAttemptRef | undefined;
export declare function buildCredentialFailureForward(opts: {
    provider: string;
    model: string;
    authType?: AuthType;
    tenantProviderId: string | null;
    keyLabel?: string;
    presentation: CredentialFailurePresentation;
    startProviderAttempt?: StartProviderAttempt;
}): ForwardResult;
export declare function buildCredentialFailureFallback(opts: {
    model: string;
    provider: string;
    fallbackIndex: number;
    authType?: AuthType;
    tenantProviderId: string | null;
    keyLabel?: string;
    presentation: CredentialFailurePresentation;
    startProviderAttempt?: StartProviderAttempt;
}): {
    model: string;
    provider: string;
    fallbackIndex: number;
    status: number;
    errorBody: string;
    authType?: AuthType;
    tenantProviderId: string | null;
    keyLabel?: string;
    attempt?: ProviderAttemptRef;
    providerCallStarted: true;
};
export declare function resolveRouteCredentials(deps: RouteCredentialDeps, args: {
    agentId: string;
    tenantId: string;
    provider: string;
    authType?: AuthType;
    providerKeyLabel?: string;
}): Promise<ResolvedRouteCredentials>;
