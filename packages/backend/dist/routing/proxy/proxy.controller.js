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
var ProxyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const uuid_1 = require("uuid");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const agent_key_auth_guard_1 = require("../../otlp/guards/agent-key-auth.guard");
const proxy_service_1 = require("./proxy.service");
const proxy_rate_limiter_1 = require("./proxy-rate-limiter");
const provider_client_1 = require("./provider-client");
const proxy_message_recorder_1 = require("./proxy-message-recorder");
const thought_signature_cache_1 = require("./thought-signature-cache");
const thinking_block_cache_1 = require("./thinking-block-cache");
const reasoning_content_cache_1 = require("./reasoning-content-cache");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const models_dev_sync_service_1 = require("../../database/models-dev-sync.service");
const provider_param_spec_service_1 = require("../routing-core/provider-param-spec.service");
const model_capabilities_1 = require("../../model-discovery/model-capabilities");
const caller_classifier_1 = require("./caller-classifier");
const observation_reporter_1 = require("../autofix/observation-reporter");
const request_headers_1 = require("./request-headers");
const proxy_session_scope_1 = require("./proxy-session-scope");
const proxy_response_handler_1 = require("./proxy-response-handler");
const proxy_exception_filter_1 = require("./proxy-exception.filter");
const proxy_friendly_response_1 = require("./proxy-friendly-response");
const error_codes_1 = require("../../common/errors/error-codes");
const manifest_error_1 = require("../../common/errors/manifest-error");
const chatgpt_adapter_1 = require("./chatgpt-adapter");
const inline_image_redaction_1 = require("./inline-image-redaction");
const secret_scrub_1 = require("../../common/utils/secret-scrub");
const openai_model_id_1 = require("./openai-model-id");
const openai_model_capabilities_1 = require("./openai-model-capabilities");
const plan_service_1 = require("../../billing/plan.service");
const stream_writer_1 = require("./stream-writer");
const agent_recording_config_service_1 = require("../../common/services/agent-recording-config.service");
const attempt_recording_service_1 = require("./attempt-recording.service");
const attempt_recording_capture_1 = require("./attempt-recording-capture");
const MAX_SEEN_TENANTS = 10_000;
const SEEN_TENANT_TTL_MS = 24 * 60 * 60 * 1000;
const MODEL_CREATED_UNKNOWN = 0;
function openAiModelCost(inputPricePerToken, outputPricePerToken) {
    const input = inputPricePerToken != null && Number.isFinite(inputPricePerToken) && inputPricePerToken >= 0
        ? inputPricePerToken * 1_000_000
        : undefined;
    const output = outputPricePerToken != null && Number.isFinite(outputPricePerToken) && outputPricePerToken >= 0
        ? outputPricePerToken * 1_000_000
        : undefined;
    if (input === undefined && output === undefined)
        return undefined;
    return {
        ...(input !== undefined ? { input } : {}),
        ...(output !== undefined ? { output } : {}),
    };
}
let ProxyController = ProxyController_1 = class ProxyController {
    proxyService;
    rateLimiter;
    providerClient;
    recorder;
    signatureCache;
    thinkingCache;
    reasoningCache;
    modelDiscovery;
    planService;
    observationReporter;
    providerParamSpecs;
    modelsDevSync;
    recordingConfig;
    attemptRecording;
    logger = new common_1.Logger(ProxyController_1.name);
    seenTenants = new Map();
    constructor(proxyService, rateLimiter, providerClient, recorder, signatureCache, thinkingCache, reasoningCache, modelDiscovery, planService, observationReporter, providerParamSpecs, modelsDevSync, recordingConfig, attemptRecording) {
        this.proxyService = proxyService;
        this.rateLimiter = rateLimiter;
        this.providerClient = providerClient;
        this.recorder = recorder;
        this.signatureCache = signatureCache;
        this.thinkingCache = thinkingCache;
        this.reasoningCache = reasoningCache;
        this.modelDiscovery = modelDiscovery;
        this.planService = planService;
        this.observationReporter = observationReporter;
        this.providerParamSpecs = providerParamSpecs;
        this.modelsDevSync = modelsDevSync;
        this.recordingConfig = recordingConfig;
        this.attemptRecording = attemptRecording;
    }
    async models(req, capabilities, cost, routeMetadata) {
        const includeCapabilities = capabilities === 'true';
        const includeCost = cost === 'true';
        const includeRouteMetadata = routeMetadata === 'true';
        const models = await this.modelDiscovery.getModelsForAgent(req.ingestionContext.tenantId, req.ingestionContext.agentId);
        const data = [
            {
                id: 'auto',
                object: 'model',
                created: MODEL_CREATED_UNKNOWN,
                owned_by: 'manifest',
            },
        ];
        const seen = new Set(data.map((model) => model.id));
        for (const model of models) {
            const id = (0, openai_model_id_1.openAiModelId)(model);
            if (seen.has(id))
                continue;
            seen.add(id);
            const entry = {
                id,
                object: 'model',
                created: MODEL_CREATED_UNKNOWN,
                owned_by: model.providerName ?? model.provider,
            };
            if (includeRouteMetadata) {
                entry.provider_model_id = model.id;
                entry.auth_type = model.authType;
            }
            if (includeCapabilities) {
                const resolved = await (0, model_capabilities_1.resolveModelCapabilityMetadata)(model, this.providerParamSpecs, this.modelsDevSync);
                const modelCapabilities = (0, openai_model_capabilities_1.openAiModelCapabilities)({ ...model, ...resolved });
                if (modelCapabilities)
                    entry.capabilities = modelCapabilities;
            }
            if (includeCost) {
                const modelCost = openAiModelCost(model.inputPricePerToken, model.outputPricePerToken);
                if (modelCost)
                    entry.cost = modelCost;
            }
            data.push(entry);
        }
        return {
            object: 'list',
            data,
        };
    }
    async chatCompletions(req, res) {
        await this.handleProxyRequest(req, res, 'chat_completions');
    }
    async responses(req, res) {
        await this.handleProxyRequest(req, res, 'responses');
    }
    async messages(req, res) {
        await this.handleProxyRequest(req, res, 'messages');
    }
    async handleProxyRequest(req, res, apiMode) {
        const { agentId, tenantId } = req.ingestionContext;
        const body = req.body;
        const sessionScope = (0, proxy_session_scope_1.buildProxySessionScope)(tenantId, agentId, req.headers['x-session-key']);
        const { sessionKey } = sessionScope;
        const traceId = this.extractTraceId(req);
        const requestId = (0, uuid_1.v4)();
        const callerAttribution = (0, caller_classifier_1.classifyCaller)(req.headers);
        const requestHeaders = (0, request_headers_1.sanitizeRequestHeaders)(req.headers);
        const isStream = body.stream === true;
        let routingBody = body;
        let headersSent = false;
        let slotAcquired = false;
        let currentMeta;
        let recordingEnabled = false;
        let currentAttempt;
        let currentAttemptStart;
        const clientAbort = new AbortController();
        res.once('close', () => clientAbort.abort());
        const startTime = Date.now();
        await this.recorder
            .recordPendingRequest(req.ingestionContext, {
            requestId,
            timestamp: new Date(startTime).toISOString(),
            traceId,
            sessionKey,
            requestedModel: this.extractRequestedModel(body),
            callerAttribution,
            requestHeaders,
            apiMode,
        })
            .catch((e) => this.logger.warn(`Failed to record pending Request: ${e}`));
        if (this.recordingConfig && this.attemptRecording) {
            try {
                recordingEnabled =
                    this.attemptRecording.available &&
                        (await this.recordingConfig.isRecording(req.ingestionContext.agentId));
            }
            catch (e) {
                recordingEnabled = false;
                this.logger.warn(`Failed to resolve attempt recording config: ${e}`);
            }
        }
        let attemptSequence = 0;
        const startedAttempts = [];
        const startProviderAttempt = (start) => {
            const startedAtMs = Date.now();
            const attempt = {
                id: (0, uuid_1.v4)(),
                attemptNumber: ++attemptSequence,
                startedAtMs,
                startedAt: new Date(startedAtMs).toISOString(),
                pendingWrite: Promise.resolve(false),
            };
            currentAttempt = attempt;
            currentAttemptStart = start;
            if (start.providerCallStarted === false)
                return attempt;
            let recordingFinished = false;
            attempt.startRecording = ({ requestBody, wireFormat }) => {
                if (!recordingEnabled || !this.attemptRecording || attempt.recordingCapture) {
                    return;
                }
                attempt.recordingCapture = (0, attempt_recording_capture_1.createAttemptRecordingCapture)(requestBody, wireFormat);
            };
            attempt.finishRecording = async (response) => {
                if (recordingFinished)
                    return;
                const capture = attempt.recordingCapture;
                if (!capture || !this.attemptRecording)
                    return;
                if (response?.type === 'stream') {
                    capture.setRaw(response.raw_sse ?? '');
                }
                else if (response?.type === 'json') {
                    capture.setJson(response.body);
                }
                recordingFinished = true;
                if (!(await attempt.pendingWrite.catch(() => false)))
                    return;
                await this.attemptRecording
                    .save(tenantId, requestId, attempt.id, capture.buildRecording())
                    .catch((e) => this.logger.warn(`Failed to finish Provider Attempt recording: ${e}`));
            };
            attempt.pendingWrite = this.recorder
                .recordPendingProviderAttempt(req.ingestionContext, requestId, attempt, start)
                .catch((e) => {
                this.logger.warn(`Failed to record pending Provider Attempt: ${e}`);
                return false;
            });
            startedAttempts.push(attempt);
            attempt.completeFailure = ({ status, errorBody, superseded }) => this.recorder
                .completePendingProviderFailure(attempt, status, errorBody, superseded)
                .catch((e) => this.logger.warn(`Failed to complete Provider Attempt: ${e}`));
            return attempt;
        };
        try {
            await this.planService.assertWithinRequestLimit(req.ingestionContext);
        }
        catch (err) {
            if (err instanceof common_1.HttpException && err.getStatus() === common_1.HttpStatus.PAYMENT_REQUIRED) {
                this.recordManifestBlockedRequest(err, req, requestId, traceId, callerAttribution, requestHeaders, 'plan_request_limit_exceeded', apiMode, common_1.HttpStatus.PAYMENT_REQUIRED, 'M204', Date.now() - startTime);
                throw err;
            }
            await this.handleProxyError(err, req, res, clientAbort, headersSent, requestId, traceId, callerAttribution, requestHeaders, apiMode, undefined, undefined);
            return;
        }
        try {
            this.rateLimiter.checkLimit(tenantId);
            this.rateLimiter.checkIpLimit(req.ip ?? '');
            this.rateLimiter.acquireSlot(tenantId);
            slotAcquired = true;
            routingBody = (0, inline_image_redaction_1.redactInlineImageDataUrls)(this.routingBody(body, req));
            const specificityOverride = req.headers['x-manifest-specificity'];
            const { forward, meta, failedFallbacks, autofix, fallbackAutofix } = await this.proxyService.proxyRequest({
                agentId: req.ingestionContext.agentId,
                tenantId,
                userId: req.ingestionContext.userId,
                body,
                routingBody,
                sessionKey,
                sessionCacheKey: sessionScope.cacheKey,
                providerCacheKey: sessionScope.providerCacheKey,
                sessionMomentumKey: sessionScope.momentumKey,
                agentName: req.ingestionContext.agentName,
                signal: clientAbort.signal,
                specificityOverride,
                headers: req.headers,
                apiMode,
                startProviderAttempt,
            });
            currentMeta = meta;
            this.trackFirstProxyRequest(tenantId);
            const metaHeaders = (0, proxy_response_handler_1.buildMetaHeaders)(meta);
            const providerResponse = forward.response;
            const responseCapture = forward.attempt?.recordingCapture;
            if (!providerResponse.ok) {
                const errorBody = await providerResponse.text();
                await forward.attempt?.finishRecording?.((0, attempt_recording_capture_1.recordingResponseFromText)(errorBody));
                const alreadyReportedByAutofix = Boolean(autofix) && !meta.fallbackFromModel;
                const wireRequestBody = forward.wireRequestBody;
                const wireApiMode = forward.wireApiMode;
                const wireFormat = forward.wireFormat;
                if (!alreadyReportedByAutofix && meta.auth_type && wireRequestBody && wireFormat) {
                    this.observationReporter.report({
                        traceId: traceId ?? (0, uuid_1.v4)(),
                        tenantId,
                        agentId: req.ingestionContext.agentId,
                        provider: meta.provider,
                        model: meta.model,
                        authType: meta.auth_type,
                        apiMode: wireApiMode ?? apiMode,
                        requestBody: wireRequestBody,
                        providerWire: {
                            format: wireFormat,
                            ...(forward.wireRequestUrl ? { url: forward.wireRequestUrl } : {}),
                            body: wireRequestBody,
                        },
                        status: providerResponse.status,
                        errorBody,
                        responseTimeMs: Date.now() - startTime,
                    });
                }
                await (0, proxy_response_handler_1.handleProviderError)(res, req.ingestionContext, meta, metaHeaders, providerResponse.status, errorBody, failedFallbacks, this.recorder, traceId, callerAttribution, requestHeaders, autofix, requestId, Date.now() - startTime, apiMode);
                return;
            }
            const fallbackSuccessTs = (0, proxy_response_handler_1.recordFallbackFailures)(req.ingestionContext, meta, failedFallbacks, this.recorder, callerAttribution, requestHeaders, autofix, requestId);
            let streamUsage = null;
            const shouldStreamResponse = isStream || meta.response_mode === 'stream';
            if (shouldStreamResponse && providerResponse.body) {
                headersSent = true;
                streamUsage = await (0, proxy_response_handler_1.handleStreamResponse)(res, forward, meta, metaHeaders, this.providerClient, this.signatureCache, sessionScope.cacheKey, this.thinkingCache, apiMode, this.reasoningCache, responseCapture);
            }
            else {
                streamUsage = await (0, proxy_response_handler_1.handleNonStreamResponse)(res, forward, meta, metaHeaders, this.providerClient, this.signatureCache, sessionScope.cacheKey, this.thinkingCache, apiMode, this.reasoningCache, responseCapture);
            }
            await forward.attempt?.finishRecording?.();
            if (meta.manifest_error_code) {
                this.recordManifestStub(req, meta, requestId, traceId, sessionKey, callerAttribution, requestHeaders, autofix, Date.now() - startTime, apiMode);
            }
            else {
                (0, proxy_response_handler_1.recordSuccess)(req.ingestionContext, meta, streamUsage, fallbackSuccessTs, this.recorder, traceId, sessionKey, startTime, callerAttribution, requestHeaders, autofix, requestId, (0, proxy_response_handler_1.currentPrimaryAttemptNumber)(autofix) +
                    (meta.fallbackFromModel ? (failedFallbacks?.length ?? 0) + 1 : 0), apiMode, fallbackAutofix);
            }
        }
        catch (err) {
            await this.handleProxyError(err, req, res, clientAbort, headersSent, requestId, traceId, callerAttribution, requestHeaders, apiMode, currentMeta, startTime, currentAttempt, currentAttemptStart);
            await (currentMeta?.attempt ?? currentAttempt)?.finishRecording?.();
            if (clientAbort.signal.aborted) {
                await this.recorder.cancelPendingProviderAttempts(startedAttempts);
            }
        }
        finally {
            if (slotAcquired)
                this.rateLimiter.releaseSlot(tenantId);
        }
    }
    routingBody(body, req) {
        const provider = req.headers['x-manifest-provider'];
        const authType = req.headers['x-manifest-auth-type'];
        const model = body.model;
        if (typeof provider !== 'string' || authType !== 'subscription' || typeof model !== 'string') {
            return body;
        }
        return { ...body, model: (0, openai_model_id_1.subscriptionOpenAiModelId)(provider, model) };
    }
    recordManifestStub(req, meta, requestId, traceId, sessionKey, callerAttribution, requestHeaders, autofix, durationMs, apiMode) {
        const code = meta.manifest_error_code;
        if (!code || !(0, manifest_error_1.isRecordableManifestCode)(code))
            return;
        this.recorder
            .recordManifestBlockedRequest(req.ingestionContext, {
            requestId,
            errorMessage: meta.manifest_error_message ?? (0, error_codes_1.formatManifestError)(code),
            errorCode: code,
            reason: manifest_error_1.MANIFEST_CODE_TO_REASON[code],
            model: this.extractRequestedModel(req.body),
            traceId,
            sessionKey,
            callerAttribution,
            requestHeaders,
            autofix,
            attempt: meta.attempt,
            durationMs,
            apiMode,
        })
            .catch((e) => this.logger.warn(`Failed to record Manifest stub: ${e}`));
    }
    async handleProxyError(err, req, res, clientAbort, headersSent, requestId, traceId, callerAttribution, requestHeaders, apiMode, meta, startTime, currentAttempt, currentAttemptStart) {
        const capture = (meta?.attempt ?? currentAttempt)?.recordingCapture;
        if (clientAbort.signal.aborted) {
            await this.recorder
                .recordCancelledRequest(req.ingestionContext, {
                requestId,
                attempt: meta?.attempt ?? currentAttempt,
                attemptStart: currentAttemptStart,
                requestDurationMs: startTime == null ? undefined : Date.now() - startTime,
                traceId,
                apiMode,
            })
                .catch((e) => this.logger.warn(`Failed to record cancelled Request: ${e}`));
            if (!res.writableEnded)
                res.end();
            return;
        }
        const message = this.extractErrorMessage(err);
        const status = err instanceof stream_writer_1.StreamFailure
            ? err.status
            : err instanceof chatgpt_adapter_1.ResponsesSseError
                ? err.status
                : err instanceof common_1.HttpException
                    ? err.getStatus()
                    : 500;
        const providerErrorBody = err instanceof chatgpt_adapter_1.ResponsesSseError ? err.body : message;
        this.logger.error(`Proxy error: ${(0, secret_scrub_1.scrubSecrets)(message)}`);
        if (err instanceof manifest_error_1.ManifestError) {
            if ((0, manifest_error_1.isRecordableManifestCode)(err.code)) {
                this.recordManifestBlockedRequest(err, req, requestId, traceId, callerAttribution, requestHeaders, manifest_error_1.MANIFEST_CODE_TO_REASON[err.code], apiMode, status, err.code, startTime == null ? undefined : Date.now() - startTime, meta);
            }
        }
        else if (!(err instanceof stream_writer_1.StreamFailure) &&
            !(err instanceof chatgpt_adapter_1.ResponsesSseError) &&
            !(err instanceof common_1.HttpException)) {
            this.recordManifestBlockedRequest(err, req, requestId, traceId, callerAttribution, requestHeaders, manifest_error_1.MANIFEST_CODE_TO_REASON.M500, apiMode, status, 'M500', startTime == null ? undefined : Date.now() - startTime, meta);
        }
        else {
            this.recorder
                .recordProviderError(req.ingestionContext, status, providerErrorBody, {
                requestId,
                ...(meta
                    ? {
                        attempt: meta.attempt,
                        attemptNumber: meta.attempt?.attemptNumber,
                        skipAttempt: meta.providerCallStarted === false,
                        model: meta.model,
                        provider: meta.provider,
                        tier: meta.tier,
                        fallbackFromModel: meta.fallbackFromModel,
                        fallbackIndex: meta.fallbackIndex,
                        authType: meta.auth_type,
                        reason: meta.reason,
                        specificityCategory: meta.specificity_category,
                        providerKeyLabel: meta.provider_key_label,
                        tenantProviderId: meta.tenantProviderId,
                        requestParams: meta.request_params,
                        headerTierId: meta.header_tier_id,
                        headerTierName: meta.header_tier_name,
                        headerTierColor: meta.header_tier_color,
                    }
                    : {}),
                traceId,
                callerAttribution,
                requestHeaders,
                requestDurationMs: startTime == null ? undefined : Date.now() - startTime,
                apiMode,
            })
                .catch((e) => this.logger.warn(`Failed to record provider error: ${e}`));
        }
        if (headersSent) {
            if (!res.writableEnded) {
                if (err instanceof stream_writer_1.StreamFailure) {
                    this.writeStreamError(res, apiMode, err, meta);
                }
                else {
                    res.end();
                }
            }
            return;
        }
        if (err instanceof chatgpt_adapter_1.ResponsesSseError) {
            const responseBody = {
                error: (0, proxy_response_handler_1.buildOpenAiCompatibleError)(err.status, err.body, meta ? { provider: meta.provider, model: meta.model } : {}),
            };
            capture?.setJson(responseBody);
            res.status(err.status).json(responseBody);
            return;
        }
        if (status === 429) {
            const rateLimitMessage = err instanceof manifest_error_1.ManifestError
                ? (0, error_codes_1.formatManifestError)(err.code)
                : 'Rate limited by upstream provider';
            const responseBody = {
                error: { message: rateLimitMessage, type: 'rate_limit_error' },
            };
            capture?.setJson(responseBody);
            res.status(429).json(responseBody);
            return;
        }
        const isStream = req.body?.stream === true;
        if ((0, proxy_exception_filter_1.isChatRenderingClient)(req)) {
            const clientMessage = status >= 500 ? (0, error_codes_1.formatManifestError)('M500') : message;
            (0, proxy_friendly_response_1.sendFriendlyResponse)(res, clientMessage, isStream);
            return;
        }
        const errorMessage = status >= 500 ? 'Manifest encountered an internal error. Try again shortly.' : message;
        const responseBody = {
            error: {
                message: errorMessage,
                type: status >= 500 ? 'server_error' : 'invalid_request_error',
            },
        };
        capture?.setJson(responseBody);
        res.status(status).json(responseBody);
    }
    writeStreamError(res, apiMode, streamError, meta) {
        const error = (0, proxy_response_handler_1.buildOpenAiCompatibleError)(streamError.status, streamError.message, {
            source: 'provider',
            code: streamError.reason,
            provider: meta?.provider,
            model: meta?.model,
        });
        error.message = streamError.message;
        if (apiMode === 'messages') {
            res.write(`event: error\ndata: ${JSON.stringify({
                type: 'error',
                error: { type: 'api_error', message: streamError.message },
            })}\n\n`);
        }
        else if (apiMode === 'responses') {
            res.write(`event: error\ndata: ${JSON.stringify({
                type: 'error',
                code: error.code ?? 'server_error',
                message: streamError.message,
                param: null,
                sequence_number: (0, proxy_response_handler_1.nextResponsesSequenceNumber)(res),
            })}\n\n`);
        }
        else {
            res.write(`data: ${JSON.stringify({ error })}\n\ndata: [DONE]\n\n`);
        }
        res.end();
    }
    extractTraceId(req) {
        const header = req.headers['traceparent'];
        if (!header)
            return undefined;
        const parts = header.split('-');
        return parts.length >= 2 ? parts[1] : undefined;
    }
    extractSessionKey(req) {
        return (0, proxy_session_scope_1.buildProxySessionScope)(req.ingestionContext.tenantId, req.ingestionContext.agentId, req.headers['x-session-key']).sessionKey;
    }
    extractRequestedModel(body) {
        const model = body?.model;
        return typeof model === 'string' && model.length > 0 ? model : undefined;
    }
    extractErrorMessage(err) {
        if (err instanceof chatgpt_adapter_1.ResponsesSseError)
            return err.body;
        if (err instanceof common_1.HttpException) {
            const response = err.getResponse();
            if (typeof response === 'string')
                return response;
            if (response && typeof response === 'object') {
                const record = response;
                const message = record.message;
                if (typeof message === 'string')
                    return message;
                if (Array.isArray(message))
                    return message.filter((m) => typeof m === 'string').join(', ');
                const error = record.error;
                if (typeof error === 'string')
                    return error;
                if (error && typeof error === 'object') {
                    const nested = error.message;
                    if (typeof nested === 'string')
                        return nested;
                }
                const code = record.code;
                if (code === 'PLAN_LIMIT_REQUESTS')
                    return 'Free plan monthly request limit reached';
                if (typeof code === 'string')
                    return code;
            }
        }
        return err instanceof Error ? err.message : String(err);
    }
    recordManifestBlockedRequest(err, req, requestId, traceId, callerAttribution, requestHeaders, reason, apiMode, httpStatus, errorCode, durationMs, meta) {
        const body = req.body;
        this.recorder
            .recordManifestBlockedRequest(req.ingestionContext, {
            requestId,
            httpStatus: httpStatus ?? (err instanceof common_1.HttpException ? err.getStatus() : 500),
            errorMessage: this.extractErrorMessage(err),
            errorCode,
            reason,
            model: this.extractRequestedModel(body),
            traceId,
            sessionKey: this.extractSessionKey(req),
            callerAttribution,
            requestHeaders,
            durationMs,
            apiMode,
            ...(meta && meta.provider !== 'manifest'
                ? {
                    routing: {
                        tier: meta.tier,
                        specificityCategory: meta.specificity_category,
                        headerTierId: meta.header_tier_id,
                        headerTierName: meta.header_tier_name,
                        headerTierColor: meta.header_tier_color,
                    },
                }
                : {}),
        })
            .catch((e) => this.logger.warn(`Failed to record Manifest-blocked request: ${e}`));
    }
    trackFirstProxyRequest(tenantId) {
        const now = Date.now();
        if (this.seenTenants.has(tenantId))
            return;
        this.evictExpiredTenants(now);
        if (this.seenTenants.size >= MAX_SEEN_TENANTS) {
            const oldest = this.seenTenants.keys().next().value;
            this.seenTenants.delete(oldest);
        }
        this.seenTenants.set(tenantId, now);
    }
    evictExpiredTenants(now) {
        for (const [key, timestamp] of this.seenTenants) {
            if (now - timestamp > SEEN_TENANT_TTL_MS) {
                this.seenTenants.delete(key);
            }
            else {
                break;
            }
        }
    }
};
exports.ProxyController = ProxyController;
__decorate([
    (0, common_1.Get)('models'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('capabilities')),
    __param(2, (0, common_1.Query)('cost')),
    __param(3, (0, common_1.Query)('route_metadata')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "models", null);
__decorate([
    (0, common_1.Post)('chat/completions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "chatCompletions", null);
__decorate([
    (0, common_1.Post)('responses'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "responses", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "messages", null);
exports.ProxyController = ProxyController = ProxyController_1 = __decorate([
    (0, common_1.Controller)('v1'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(agent_key_auth_guard_1.AgentKeyAuthGuard),
    (0, common_1.UseFilters)(proxy_exception_filter_1.ProxyExceptionFilter),
    (0, throttler_1.SkipThrottle)(),
    __param(12, (0, common_1.Optional)()),
    __param(13, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService,
        proxy_rate_limiter_1.ProxyRateLimiter,
        provider_client_1.ProviderClient,
        proxy_message_recorder_1.ProxyMessageRecorder,
        thought_signature_cache_1.ThoughtSignatureCache,
        thinking_block_cache_1.ThinkingBlockCache,
        reasoning_content_cache_1.ReasoningContentCache,
        model_discovery_service_1.ModelDiscoveryService,
        plan_service_1.PlanService,
        observation_reporter_1.ObservationReporter,
        provider_param_spec_service_1.ProviderParamSpecService,
        models_dev_sync_service_1.ModelsDevSyncService,
        agent_recording_config_service_1.AgentRecordingConfigService,
        attempt_recording_service_1.AttemptRecordingService])
], ProxyController);
//# sourceMappingURL=proxy.controller.js.map