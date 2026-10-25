"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PlaygroundService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const provider_client_1 = require("../routing/proxy/provider-client");
const provider_hooks_1 = require("../routing/proxy/provider-hooks");
const forward_endpoint_resolver_1 = require("../routing/proxy/forward-endpoint-resolver");
const custom_provider_service_1 = require("../routing/custom-provider/custom-provider.service");
const oauth_credentials_1 = require("../routing/proxy/oauth-credentials");
const provider_key_service_1 = require("../routing/routing-core/provider-key.service");
const provider_availability_1 = require("../common/utils/provider-availability");
const opencode_go_catalog_service_1 = require("../model-discovery/opencode-go-catalog.service");
const providers_1 = require("../common/constants/providers");
const playground_agent_service_1 = require("./playground-agent.service");
const openai_oauth_service_1 = require("../routing/oauth/openai/openai-oauth.service");
const minimax_oauth_service_1 = require("../routing/oauth/minimax/minimax-oauth.service");
const anthropic_oauth_service_1 = require("../routing/oauth/anthropic/anthropic-oauth.service");
const gemini_oauth_service_1 = require("../routing/oauth/gemini/gemini-oauth.service");
const kiro_oauth_service_1 = require("../routing/oauth/kiro/kiro-oauth.service");
const xai_oauth_service_1 = require("../routing/oauth/xai/xai-oauth.service");
const model_pricing_cache_service_1 = require("../model-prices/model-pricing-cache.service");
const cost_calculator_1 = require("../common/utils/cost-calculator");
const secret_scrub_1 = require("../common/utils/secret-scrub");
const ingest_event_bus_service_1 = require("../common/services/ingest-event-bus.service");
const stream_writer_1 = require("../routing/proxy/stream-writer");
const playground_response_headers_1 = require("./playground-response-headers");
const request_header_sanitizer_1 = require("./request-header-sanitizer");
const playground_history_service_1 = require("./playground-history.service");
const playground_payload_1 = require("./playground-payload");
const playground_stream_1 = require("./playground-stream");
const request_entity_1 = require("../entities/request.entity");
let PlaygroundService = PlaygroundService_1 = class PlaygroundService {
    playgroundAgent;
    providerKeyService;
    providerClient;
    openaiOauth;
    minimaxOauth;
    anthropicOauth;
    geminiOauth;
    kiroOauth;
    xaiOauth;
    pricingCache;
    eventBus;
    history;
    messageRepo;
    customProviderRepo;
    customProviders;
    opencodeGoCatalog;
    logger = new common_1.Logger(PlaygroundService_1.name);
    constructor(playgroundAgent, providerKeyService, providerClient, openaiOauth, minimaxOauth, anthropicOauth, geminiOauth, kiroOauth, xaiOauth, pricingCache, eventBus, history, messageRepo, customProviderRepo, customProviders, opencodeGoCatalog) {
        this.playgroundAgent = playgroundAgent;
        this.providerKeyService = providerKeyService;
        this.providerClient = providerClient;
        this.openaiOauth = openaiOauth;
        this.minimaxOauth = minimaxOauth;
        this.anthropicOauth = anthropicOauth;
        this.geminiOauth = geminiOauth;
        this.kiroOauth = kiroOauth;
        this.xaiOauth = xaiOauth;
        this.pricingCache = pricingCache;
        this.eventBus = eventBus;
        this.history = history;
        this.messageRepo = messageRepo;
        this.customProviderRepo = customProviderRepo;
        this.customProviders = customProviders;
        this.opencodeGoCatalog = opencodeGoCatalog;
    }
    buildExtraHeaders(agent, dto) {
        const userHeaders = (0, request_header_sanitizer_1.sanitizeRequestHeaders)(dto.requestHeaders);
        const providerHeaders = (0, provider_hooks_1.buildProviderExtraHeaders)(dto.provider, undefined, `${agent.tenant_id}\u0000${agent.id}`);
        if (!providerHeaders)
            return userHeaders;
        if (!userHeaders)
            return providerHeaders;
        const userNames = new Set(Object.keys(userHeaders).map((name) => name.toLowerCase()));
        const missing = Object.entries(providerHeaders).filter(([name]) => !userNames.has(name.toLowerCase()));
        return { ...Object.fromEntries(missing), ...userHeaders };
    }
    async runStream(ctx, dto, res) {
        let agent;
        let resolvedAgent = null;
        let authType;
        let apiKey;
        let rawApiKey;
        let providerKeyLabel;
        let providerResource;
        let oauthResourceUrl;
        let providerRegion;
        try {
            agent = await this.playgroundAgent.resolve(ctx);
            resolvedAgent = agent;
            const hasProvider = await this.providerKeyService.hasActiveProvider(agent.tenant_id, dto.provider, agent.id);
            if (!hasProvider) {
                const message = `Provider "${dto.provider}" is not connected for this agent`;
                await this.recordRequestRejection(ctx.userId, agent, dto, 404, message, 'config');
                return this.sendPreStreamError(res, 404, message);
            }
            authType =
                dto.authType ??
                    (await this.providerKeyService.getAuthType(agent.tenant_id, dto.provider, undefined, agent.id));
            const keys = await this.providerKeyService.getProviderKeys(agent.tenant_id, dto.provider, authType, agent.id);
            const key = keys[0];
            if (!key || key.apiKey === null) {
                const message = `No usable API key found for provider "${dto.provider}"`;
                await this.recordRequestRejection(ctx.userId, agent, dto, 404, message, 'config');
                return this.sendPreStreamError(res, 404, message);
            }
            rawApiKey = key.apiKey;
            providerKeyLabel = key.label;
            providerRegion = key.region;
            const resolved = await (0, oauth_credentials_1.resolveApiKey)(dto.provider, rawApiKey, authType, agent.id, agent.tenant_id, this.openaiOauth, this.minimaxOauth, this.anthropicOauth, this.geminiOauth, this.kiroOauth, this.xaiOauth, providerKeyLabel);
            if (resolved.apiKey === null) {
                const message = `No usable API key found for provider "${dto.provider}"`;
                await this.recordRequestRejection(ctx.userId, agent, dto, 404, message, 'config');
                return this.sendPreStreamError(res, 404, message);
            }
            apiKey = resolved.apiKey;
            if (authType === 'subscription' && (0, oauth_credentials_1.isRefreshableOAuthCredential)(rawApiKey)) {
                rawApiKey =
                    (await this.providerKeyService.getProviderApiKey(agent.tenant_id, dto.provider, authType, providerKeyLabel, agent.id)) ?? rawApiKey;
            }
            oauthResourceUrl = authType === 'subscription' ? resolved.resourceUrl : undefined;
            providerResource =
                authType === 'subscription' && dto.provider.toLowerCase() === 'gemini'
                    ? resolved.resourceUrl
                    : undefined;
        }
        catch (err) {
            const status = err instanceof common_1.HttpException ? err.getStatus() : 500;
            const message = err instanceof Error ? err.message : String(err);
            if (resolvedAgent) {
                await this.recordRequestRejection(ctx.userId, resolvedAgent, dto, status, message, status >= 500 ? 'internal' : 'config');
            }
            return this.sendPreStreamError(res, status, message);
        }
        const extraHeaders = this.buildExtraHeaders(agent, dto);
        const abort = new AbortController();
        res.on('close', () => abort.abort());
        const customProvider = custom_provider_service_1.CustomProviderService.isCustom(dto.provider)
            ? await this.customProviderRepo.findOne({
                where: { id: custom_provider_service_1.CustomProviderService.extractId(dto.provider), tenant_id: agent.tenant_id },
            })
            : null;
        const { customEndpoint, forwardModel } = (0, forward_endpoint_resolver_1.resolveForwardEndpoint)({
            provider: dto.provider,
            authType,
            model: dto.model,
            providerRegion,
            resourceUrl: oauthResourceUrl,
            customProvider,
            logger: this.logger,
        });
        const startedAt = Date.now();
        let forward;
        try {
            const forwardOptions = {
                provider: dto.provider,
                apiKey,
                model: forwardModel,
                body: (0, playground_payload_1.buildForwardBody)(dto),
                stream: true,
                authType,
                extraHeaders,
                customEndpoint,
                signal: abort.signal,
                providerResource,
            };
            forward = await this.providerClient.forward(forwardOptions);
            if (forward.response.status === 401 && authType === 'subscription') {
                const refreshed = await (0, oauth_credentials_1.refreshRejectedOAuthCredential)(dto.provider, rawApiKey, agent.id, agent.tenant_id, providerKeyLabel, {
                    openaiOauth: this.openaiOauth,
                    minimaxOauth: this.minimaxOauth,
                    anthropicOauth: this.anthropicOauth,
                    geminiOauth: this.geminiOauth,
                    kiroOauth: this.kiroOauth,
                    xaiOauth: this.xaiOauth,
                });
                if (refreshed?.apiKey && refreshed.apiKey !== apiKey) {
                    this.logger.log(`OAuth token rejected upstream in Playground; refreshed provider=${dto.provider} agent=${agent.id}`);
                    apiKey = refreshed.apiKey;
                    providerResource =
                        authType === 'subscription' && dto.provider.toLowerCase() === 'gemini'
                            ? (refreshed.resourceUrl ?? providerResource)
                            : providerResource;
                    forward = await this.providerClient.forward({
                        ...forwardOptions,
                        apiKey,
                        providerResource,
                    });
                }
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (!abort.signal.aborted) {
                await this.recordError(ctx.userId, agent, dto, authType, 502, message, Date.now() - startedAt, 'transport');
            }
            return this.sendPreStreamError(res, 502, `Provider request failed: ${message}`);
        }
        const headers = (0, playground_response_headers_1.whitelistResponseHeaders)(forward.response.headers);
        if (!forward.response.ok) {
            let bodyText = '';
            try {
                bodyText = await forward.response.text();
            }
            catch {
            }
            const durationMs = Date.now() - startedAt;
            const errorSummary = this.truncateError(bodyText, forward.response.status);
            await this.recordError(ctx.userId, agent, dto, authType, forward.response.status, bodyText, durationMs);
            await this.history.saveColumn(this.errorColumn(ctx.userId, agent, dto, authType, headers, errorSummary));
            return this.sendPreStreamError(res, 502, errorSummary);
        }
        (0, stream_writer_1.initSseHeaders)(res, {});
        const send = (event) => {
            if (res.writableEnded)
                return;
            res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
        };
        if (!forward.response.body) {
            const message = 'Provider returned an empty stream';
            await this.recordError(ctx.userId, agent, dto, authType, 502, message, Date.now() - startedAt);
            await this.history.saveColumn(this.errorColumn(ctx.userId, agent, dto, authType, headers, message));
            send({ type: 'error', message });
            res.end();
            return;
        }
        try {
            const { content, usage, ttftMs, totalMs } = await (0, playground_stream_1.consumeProviderStream)(forward.response.body, forward, dto.model, this.providerClient, (text) => send({ type: 'delta', text }), startedAt);
            const inputTokens = usage?.prompt_tokens ?? 0;
            const outputTokens = usage?.completion_tokens ?? 0;
            const cacheReadTokens = usage?.cache_read_tokens ?? 0;
            const cacheCreationTokens = usage?.cache_creation_tokens ?? 0;
            const canonicalProvider = await this.customProviders
                .canonicalizeAgentMessageKeys(ctx.tenantId ?? '', dto.provider, dto.model)
                .then(({ provider }) => provider ?? dto.provider)
                .catch(() => dto.provider);
            const cost = (0, cost_calculator_1.computeTokenCost)({
                inputTokens,
                outputTokens,
                cacheReadTokens,
                cacheCreationTokens,
                model: dto.model,
                pricing: this.pricingCache.getByModel(dto.model, dto.provider),
                isSubscription: authType === 'subscription',
                isLocalProvider: (0, provider_availability_1.isLocalOnlyProvider)(canonicalProvider),
                perRequestCostUsd: authType === 'subscription' &&
                    providers_1.PROVIDER_BY_ID_OR_ALIAS.get(canonicalProvider.toLowerCase())?.id === 'opencode-go'
                    ? await this.opencodeGoCatalog.resolveCostPerRequest(dto.model)
                    : null,
                reportedCostUsd: usage?.reported_cost_usd,
                at: new Date(startedAt),
            });
            const tokensPerSec = outputTokens > 0 ? outputTokens / (Math.max(totalMs, 1) / 1000) : null;
            await this.recordSuccess(ctx.userId, agent, dto, authType, {
                inputTokens,
                outputTokens,
                cacheReadTokens,
                cacheCreationTokens,
                cost,
                durationMs: totalMs,
            });
            const columnId = await this.history.saveColumn({
                createdByUserId: ctx.userId,
                agent,
                runId: dto.runId,
                prompt: (0, playground_payload_1.derivePromptForHistory)(dto),
                model: dto.model,
                provider: dto.provider,
                authType,
                displayName: null,
                position: dto.position ?? 0,
                status: 'success',
                content,
                headers,
                errorMessage: null,
                metrics: { inputTokens, outputTokens, cost, durationMs: totalMs },
            });
            send({
                type: 'done',
                columnId,
                content,
                metrics: { cost, inputTokens, outputTokens, durationMs: totalMs, ttftMs, tokensPerSec },
                headers,
            });
            res.end();
        }
        catch (err) {
            if (abort.signal.aborted) {
                if (!res.writableEnded)
                    res.end();
                return;
            }
            const message = err instanceof Error ? err.message : String(err);
            const durationMs = Date.now() - startedAt;
            await this.recordError(ctx.userId, agent, dto, authType, 502, message, durationMs);
            await this.history.saveColumn(this.errorColumn(ctx.userId, agent, dto, authType, headers, message));
            send({ type: 'error', message });
            if (!res.writableEnded)
                res.end();
        }
    }
    sendPreStreamError(res, status, message) {
        if (res.headersSent || res.writableEnded)
            return;
        res.status(status).json({ statusCode: status, message });
    }
    errorColumn(createdByUserId, agent, dto, authType, headers, errorMessage) {
        return {
            createdByUserId,
            agent,
            runId: dto.runId,
            prompt: (0, playground_payload_1.derivePromptForHistory)(dto),
            model: dto.model,
            provider: dto.provider,
            authType,
            displayName: null,
            position: dto.position ?? 0,
            status: 'error',
            content: null,
            headers,
            errorMessage,
            metrics: null,
        };
    }
    async recordSuccess(createdByUserId, agent, dto, authType, metrics) {
        try {
            const requestId = (0, uuid_1.v4)();
            const timestamp = new Date().toISOString();
            await this.insertPlaygroundRequest({
                id: (0, uuid_1.v4)(),
                request_id: requestId,
                attempt_number: 1,
                tenant_id: agent.tenant_id,
                agent_id: agent.id,
                agent_name: agent.name,
                user_id: createdByUserId,
                timestamp,
                status: 'success',
                model: dto.model,
                provider: dto.provider,
                routing_tier: 'playground',
                routing_reason: null,
                auth_type: authType,
                input_tokens: metrics.inputTokens,
                output_tokens: metrics.outputTokens,
                cache_read_tokens: metrics.cacheReadTokens,
                cache_creation_tokens: metrics.cacheCreationTokens,
                cost_usd: metrics.cost,
                duration_ms: metrics.durationMs,
            }, {
                id: requestId,
                tenant_id: agent.tenant_id,
                agent_id: agent.id,
                user_id: createdByUserId,
                agent_name: agent.name,
                trace_id: null,
                session_key: null,
                session_id: null,
                timestamp,
                duration_ms: metrics.durationMs,
                status: 'success',
                autofix_status: null,
                error_message: null,
                error_http_status: null,
                error_code: null,
                error_origin: null,
                error_class: null,
                requested_model: dto.model,
                api_mode: null,
                caller_attribution: null,
                request_headers: null,
                request_params: null,
                feedback_rating: null,
                feedback_tags: null,
                feedback_details: null,
            });
            this.eventBus.emit(agent.tenant_id);
        }
        catch (err) {
            this.logger.warn(`Failed to record playground success: ${err instanceof Error ? err.message : err}`);
        }
    }
    async recordError(createdByUserId, agent, dto, authType, status, errorBody, durationMs, errorOrigin = 'provider') {
        try {
            const requestId = (0, uuid_1.v4)();
            const timestamp = new Date().toISOString();
            const errorMessage = (0, secret_scrub_1.scrubSecrets)(errorBody).slice(0, 2000);
            await this.insertPlaygroundRequest({
                id: (0, uuid_1.v4)(),
                request_id: requestId,
                attempt_number: 1,
                tenant_id: agent.tenant_id,
                agent_id: agent.id,
                agent_name: agent.name,
                user_id: createdByUserId,
                timestamp,
                status: 'failed',
                error_message: errorMessage,
                error_http_status: status,
                error_origin: errorOrigin,
                model: dto.model,
                provider: dto.provider,
                routing_tier: 'playground',
                routing_reason: null,
                auth_type: authType,
                duration_ms: durationMs,
            }, {
                id: requestId,
                tenant_id: agent.tenant_id,
                agent_id: agent.id,
                user_id: createdByUserId,
                agent_name: agent.name,
                trace_id: null,
                session_key: null,
                session_id: null,
                timestamp,
                duration_ms: durationMs,
                status: 'failed',
                autofix_status: null,
                error_message: errorMessage,
                error_http_status: status,
                error_code: null,
                error_origin: errorOrigin,
                error_class: null,
                requested_model: dto.model,
                api_mode: null,
                caller_attribution: null,
                request_headers: null,
                request_params: null,
                feedback_rating: null,
                feedback_tags: null,
                feedback_details: null,
            });
            this.eventBus.emit(agent.tenant_id);
        }
        catch (err) {
            this.logger.warn(`Failed to record playground error: ${err instanceof Error ? err.message : err}`);
        }
    }
    async recordRequestRejection(createdByUserId, agent, dto, status, errorBody, errorOrigin) {
        try {
            const getRepository = this.messageRepo.manager?.getRepository?.bind(this.messageRepo.manager);
            if (!getRepository)
                return;
            const errorMessage = (0, secret_scrub_1.scrubSecrets)(errorBody).slice(0, 2000);
            await getRepository(request_entity_1.ManifestRequest).insert({
                id: (0, uuid_1.v4)(),
                tenant_id: agent.tenant_id,
                agent_id: agent.id,
                user_id: createdByUserId,
                agent_name: agent.name,
                trace_id: null,
                session_key: null,
                session_id: null,
                timestamp: new Date().toISOString(),
                duration_ms: 0,
                status: 'failed',
                autofix_status: null,
                error_message: errorMessage,
                error_http_status: status,
                error_code: null,
                error_origin: errorOrigin,
                error_class: null,
                requested_model: dto.model,
                caller_attribution: null,
                request_headers: null,
                request_params: null,
                feedback_rating: null,
                feedback_tags: null,
                feedback_details: null,
            });
            this.eventBus.emit(agent.tenant_id);
        }
        catch (err) {
            this.logger.warn(`Failed to record playground rejection: ${err instanceof Error ? err.message : err}`);
        }
    }
    async insertPlaygroundRequest(attempt, request) {
        const getRepository = this.messageRepo.manager?.getRepository?.bind(this.messageRepo.manager);
        if (!getRepository) {
            await this.messageRepo.insert(attempt);
            return;
        }
        await getRepository(request_entity_1.ManifestRequest).insert(request);
        await this.messageRepo.insert(attempt);
    }
    truncateError(bodyText, status) {
        const snippet = (0, secret_scrub_1.scrubSecrets)(bodyText).slice(0, 500).trim();
        return snippet ? `Provider returned ${status}: ${snippet}` : `Provider returned ${status}`;
    }
};
exports.PlaygroundService = PlaygroundService;
exports.PlaygroundService = PlaygroundService = PlaygroundService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(12, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(13, (0, typeorm_1.InjectRepository)(custom_provider_entity_1.CustomProvider)),
    __metadata("design:paramtypes", [playground_agent_service_1.PlaygroundAgentService,
        provider_key_service_1.ProviderKeyService,
        provider_client_1.ProviderClient,
        openai_oauth_service_1.OpenaiOauthService,
        minimax_oauth_service_1.MinimaxOauthService,
        anthropic_oauth_service_1.AnthropicOauthService,
        gemini_oauth_service_1.GeminiOauthService,
        kiro_oauth_service_1.KiroOauthService,
        xai_oauth_service_1.XaiOauthService,
        model_pricing_cache_service_1.ModelPricingCacheService,
        ingest_event_bus_service_1.IngestEventBusService,
        playground_history_service_1.PlaygroundHistoryService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        custom_provider_service_1.CustomProviderService,
        opencode_go_catalog_service_1.OpencodeGoCatalogService])
], PlaygroundService);
//# sourceMappingURL=playground.service.js.map