import { OnModuleDestroy } from '@nestjs/common';
import { Repository } from 'typeorm';
import { type RequestParamDefaults } from 'manifest-shared';
import { AgentMessage } from '../../entities/agent-message.entity';
import { ModelPricingCacheService } from '../../model-prices/model-pricing-cache.service';
import { IngestEventBusService } from '../../common/services/ingest-event-bus.service';
import { IngestionContext } from '../../otlp/interfaces/ingestion-context.interface';
import { FailedFallback } from './proxy-fallback.service';
import { StreamUsage } from './stream-writer';
import { CallerAttribution } from './caller-classifier';
import type { ProviderAttemptRef, ProviderAttemptStart, ProxyApiMode } from './proxy-types';
import { CustomProviderService } from '../custom-provider/custom-provider.service';
import { OpencodeGoCatalogService } from '../../model-discovery/opencode-go-catalog.service';
import { ProviderService } from '../routing-core/provider.service';
import { type ManifestErrorCode } from '../../common/errors/error-codes';
import { type ManifestBlockedRequestReason } from '../../common/errors/manifest-error';
import { type AutofixRecord } from '../autofix/autofix.types';
export declare const FAILED_WITHOUT_MESSAGE = "Request failed without an error message.";
export interface HeaderTierRef {
    headerTierId?: string | null;
    headerTierName?: string | null;
    headerTierColor?: string | null;
}
export interface ProviderErrorOpts extends HeaderTierRef {
    requestId?: string;
    attemptNumber?: number;
    attempt?: ProviderAttemptRef;
    skipAttempt?: boolean;
    requestDurationMs?: number;
    model?: string;
    provider?: string;
    tier?: string;
    traceId?: string;
    fallbackFromModel?: string;
    fallbackIndex?: number;
    authType?: string;
    reason?: string;
    specificityCategory?: string;
    providerKeyLabel?: string;
    tenantProviderId?: string | null;
    callerAttribution?: CallerAttribution | null;
    requestHeaders?: Record<string, string> | null;
    requestParams?: RequestParamDefaults | null;
    autofix?: AutofixRecord;
    apiMode?: ProxyApiMode;
}
export type { ManifestBlockedRequestReason };
export interface ManifestBlockedRequestOpts {
    requestId?: string;
    attempt?: ProviderAttemptRef;
    httpStatus?: number | null;
    errorMessage: string;
    errorCode?: ManifestErrorCode;
    reason: ManifestBlockedRequestReason;
    model?: string;
    traceId?: string;
    sessionKey?: string;
    callerAttribution?: CallerAttribution | null;
    requestHeaders?: Record<string, string> | null;
    autofix?: AutofixRecord;
    durationMs?: number;
    apiMode?: ProxyApiMode;
    routing?: ManifestBlockedRouting;
}
export interface ManifestBlockedRouting {
    tier?: string;
    specificityCategory?: string;
    headerTierId?: string;
    headerTierName?: string;
    headerTierColor?: string;
}
export interface PendingRequestOpts {
    requestId: string;
    timestamp: string;
    traceId?: string;
    sessionKey?: string;
    requestedModel?: string;
    callerAttribution?: CallerAttribution | null;
    requestHeaders?: Record<string, string> | null;
    apiMode?: ProxyApiMode;
}
export interface CancelledRequestOpts {
    requestId: string;
    attempt?: ProviderAttemptRef;
    attemptStart?: ProviderAttemptStart;
    requestDurationMs?: number;
    traceId?: string;
    apiMode?: ProxyApiMode;
}
export interface FallbackSuccessOpts extends HeaderTierRef {
    requestId?: string;
    attemptNumber?: number;
    attempt?: ProviderAttemptRef;
    requestDurationMs?: number;
    traceId?: string;
    provider?: string;
    fallbackFromModel?: string;
    fallbackIndex?: number;
    timestamp?: string;
    authType?: string;
    reason?: string;
    providerKeyLabel?: string;
    tenantProviderId?: string | null;
    usage?: StreamUsage;
    callerAttribution?: CallerAttribution | null;
    requestHeaders?: Record<string, string> | null;
    requestParams?: RequestParamDefaults | null;
    autofix?: AutofixRecord;
    fallbackAutofix?: AutofixRecord;
    apiMode?: ProxyApiMode;
}
export interface SuccessMessageOpts extends HeaderTierRef {
    requestId?: string;
    attemptNumber?: number;
    attempt?: ProviderAttemptRef;
    traceId?: string;
    provider?: string;
    authType?: string;
    sessionKey?: string;
    durationMs?: number;
    specificityCategory?: string;
    providerKeyLabel?: string;
    tenantProviderId?: string | null;
    callerAttribution?: CallerAttribution | null;
    requestHeaders?: Record<string, string> | null;
    requestParams?: RequestParamDefaults | null;
    autofix?: AutofixRecord;
    apiMode?: ProxyApiMode;
}
export interface AutofixOriginalOpts extends HeaderTierRef {
    requestId?: string;
    attemptNumber?: number;
    attempt?: ProviderAttemptRef;
    provider?: string;
    reason?: string;
    authType?: string;
    traceId?: string;
    specificityCategory?: string;
    providerKeyLabel?: string;
    tenantProviderId?: string | null;
    callerAttribution?: CallerAttribution | null;
    requestHeaders?: Record<string, string> | null;
    requestParams?: RequestParamDefaults | null;
}
export declare class ProxyMessageRecorder implements OnModuleDestroy {
    private readonly messageRepo;
    private readonly pricingCache;
    private readonly eventBus;
    private readonly customProviders;
    private readonly opencodeGoCatalog;
    private readonly providerService?;
    private readonly logger;
    private readonly rateLimitCooldown;
    private readonly RATE_LIMIT_COOLDOWN_MS;
    private readonly MAX_COOLDOWN_ENTRIES;
    private readonly cooldownCleanupTimer;
    constructor(messageRepo: Repository<AgentMessage>, pricingCache: ModelPricingCacheService, eventBus: IngestEventBusService, customProviders: CustomProviderService, opencodeGoCatalog: OpencodeGoCatalogService, providerService?: ProviderService | undefined);
    onModuleDestroy(): void;
    private isCopilotSubscription;
    private copilotTokenPricing;
    private computeCost;
    private persistRequest;
    private persistAttempt;
    private shouldSkipRateLimitRecord;
    recordPendingRequest(ctx: IngestionContext, opts: PendingRequestOpts): Promise<void>;
    recordPendingProviderAttempt(ctx: IngestionContext, requestId: string, attempt: ProviderAttemptRef, start: ProviderAttemptStart): Promise<boolean>;
    recordCancelledRequest(ctx: IngestionContext, opts: CancelledRequestOpts): Promise<void>;
    cancelPendingProviderAttempts(attempts: ProviderAttemptRef[]): Promise<void>;
    completePendingProviderFailure(attempt: ProviderAttemptRef, status: number, errorBody: string, superseded: boolean): Promise<void>;
    recordProviderError(ctx: IngestionContext, httpStatus: number, errorMessage: string, opts?: ProviderErrorOpts): Promise<void>;
    recordManifestBlockedRequest(ctx: IngestionContext, opts: ManifestBlockedRequestOpts): Promise<void>;
    recordFailedFallbacks(ctx: IngestionContext, tier: string, primaryModel: string, failures: FailedFallback[], opts?: {
        traceId?: string;
        requestId?: string;
        firstAttemptNumber?: number;
        baseTimeMs?: number;
        markHandled?: boolean;
        lastAsError?: boolean;
        authType?: string;
        providerKeyLabel?: string;
        reason?: string;
        callerAttribution?: CallerAttribution | null;
        requestHeaders?: Record<string, string> | null;
        requestParams?: RequestParamDefaults | null;
        headerTierId?: string | null;
        headerTierName?: string | null;
        headerTierColor?: string | null;
    }): Promise<void>;
    recordPrimaryFailure(ctx: IngestionContext, tier: string, model: string, errorBody: string, timestamp: string, authType?: string, opts?: {
        provider?: string;
        requestId?: string;
        attemptNumber?: number;
        attempt?: ProviderAttemptRef;
        skipAttempt?: boolean;
        requestDurationMs?: number;
        reason?: string;
        tenantProviderId?: string | null;
        providerKeyLabel?: string;
        callerAttribution?: CallerAttribution | null;
        requestHeaders?: Record<string, string> | null;
        requestParams?: RequestParamDefaults | null;
        headerTierId?: string | null;
        headerTierName?: string | null;
        headerTierColor?: string | null;
        httpStatus?: number | null;
        autofix?: AutofixRecord;
        terminalHttpStatus?: number;
        apiMode?: ProxyApiMode;
    }): Promise<void>;
    recordFallbackSuccess(ctx: IngestionContext, model: string, tier: string, opts?: FallbackSuccessOpts): Promise<void>;
    recordSuccessMessage(ctx: IngestionContext, model: string, tier: string, reason: string, usage: StreamUsage, opts?: SuccessMessageOpts): Promise<void>;
    recordAutofixOriginal(ctx: IngestionContext, model: string, tier: string, autofix: AutofixRecord, opts?: AutofixOriginalOpts): Promise<void>;
    private perRequestSubscriptionCost;
    private evictExpiredCooldowns;
}
