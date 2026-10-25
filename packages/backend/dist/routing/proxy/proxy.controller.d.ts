import { Request, Response as ExpressResponse } from 'express';
import { IngestionContext } from '../../otlp/interfaces/ingestion-context.interface';
import { ProxyService } from './proxy.service';
import { ProxyRateLimiter } from './proxy-rate-limiter';
import { ProviderClient } from './provider-client';
import { ProxyMessageRecorder } from './proxy-message-recorder';
import { ThoughtSignatureCache } from './thought-signature-cache';
import { ThinkingBlockCache } from './thinking-block-cache';
import { ReasoningContentCache } from './reasoning-content-cache';
import { ModelDiscoveryService } from '../../model-discovery/model-discovery.service';
import { ModelsDevSyncService } from '../../database/models-dev-sync.service';
import { ProviderParamSpecService } from '../routing-core/provider-param-spec.service';
import { ObservationReporter } from '../autofix/observation-reporter';
import { type OpenAiModelCapabilities } from './openai-model-capabilities';
import { PlanService } from '../../billing/plan.service';
import { AgentRecordingConfigService } from '../../common/services/agent-recording-config.service';
import { AttemptRecordingService } from './attempt-recording.service';
interface OpenAiModelObject {
    id: string;
    object: 'model';
    created: number;
    owned_by: string;
    provider_model_id?: string;
    auth_type?: string;
    capabilities?: OpenAiModelCapabilities;
    cost?: OpenAiModelCost;
}
interface OpenAiModelCost {
    input?: number;
    output?: number;
}
interface OpenAiModelList {
    object: 'list';
    data: OpenAiModelObject[];
}
export declare class ProxyController {
    private readonly proxyService;
    private readonly rateLimiter;
    private readonly providerClient;
    private readonly recorder;
    private readonly signatureCache;
    private readonly thinkingCache;
    private readonly reasoningCache;
    private readonly modelDiscovery;
    private readonly planService;
    private readonly observationReporter;
    private readonly providerParamSpecs;
    private readonly modelsDevSync;
    private readonly recordingConfig?;
    private readonly attemptRecording?;
    private readonly logger;
    private readonly seenTenants;
    constructor(proxyService: ProxyService, rateLimiter: ProxyRateLimiter, providerClient: ProviderClient, recorder: ProxyMessageRecorder, signatureCache: ThoughtSignatureCache, thinkingCache: ThinkingBlockCache, reasoningCache: ReasoningContentCache, modelDiscovery: ModelDiscoveryService, planService: PlanService, observationReporter: ObservationReporter, providerParamSpecs: ProviderParamSpecService, modelsDevSync: ModelsDevSyncService, recordingConfig?: AgentRecordingConfigService | undefined, attemptRecording?: AttemptRecordingService | undefined);
    models(req: Request & {
        ingestionContext: IngestionContext;
    }, capabilities?: string, cost?: string, routeMetadata?: string): Promise<OpenAiModelList>;
    chatCompletions(req: Request & {
        ingestionContext: IngestionContext;
    }, res: ExpressResponse): Promise<void>;
    responses(req: Request & {
        ingestionContext: IngestionContext;
    }, res: ExpressResponse): Promise<void>;
    messages(req: Request & {
        ingestionContext: IngestionContext;
    }, res: ExpressResponse): Promise<void>;
    private handleProxyRequest;
    private routingBody;
    private recordManifestStub;
    private handleProxyError;
    private writeStreamError;
    private extractTraceId;
    private extractSessionKey;
    private extractRequestedModel;
    private extractErrorMessage;
    private recordManifestBlockedRequest;
    private trackFirstProxyRequest;
    private evictExpiredTenants;
}
export {};
