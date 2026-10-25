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
var ProxyFallbackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeProviderModel = exports.ProxyFallbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manifest_shared_1 = require("manifest-shared");
const agent_model_params_service_1 = require("../routing-core/agent-model-params.service");
const provider_param_spec_service_1 = require("../routing-core/provider-param-spec.service");
const autofix_service_1 = require("../autofix/autofix.service");
const autofix_types_1 = require("../autofix/autofix.types");
const provider_key_service_1 = require("../routing-core/provider-key.service");
const custom_provider_entity_1 = require("../../entities/custom-provider.entity");
const custom_provider_service_1 = require("../custom-provider/custom-provider.service");
const forward_endpoint_resolver_1 = require("./forward-endpoint-resolver");
const openai_oauth_service_1 = require("../oauth/openai/openai-oauth.service");
const minimax_oauth_service_1 = require("../oauth/minimax/minimax-oauth.service");
const anthropic_oauth_service_1 = require("../oauth/anthropic/anthropic-oauth.service");
const gemini_oauth_service_1 = require("../oauth/gemini/gemini-oauth.service");
const kiro_oauth_service_1 = require("../oauth/kiro/kiro-oauth.service");
const xai_oauth_service_1 = require("../oauth/xai/xai-oauth.service");
const model_pricing_cache_service_1 = require("../../model-prices/model-pricing-cache.service");
const provider_client_1 = require("./provider-client");
const provider_endpoints_1 = require("./provider-endpoints");
const copilot_token_service_1 = require("./copilot-token.service");
const reasoning_content_cache_1 = require("./reasoning-content-cache");
const provider_hooks_1 = require("./provider-hooks");
const fallback_status_codes_1 = require("./fallback-status-codes");
const stream_warmup_1 = require("./stream-warmup");
const provider_aliases_1 = require("../../common/utils/provider-aliases");
const anthropic_model_id_1 = require("../../common/utils/anthropic-model-id");
Object.defineProperty(exports, "normalizeProviderModel", { enumerable: true, get: function () { return anthropic_model_id_1.normalizeProviderModel; } });
const proxy_transport_1 = require("./proxy-transport");
const oauth_credentials_1 = require("./oauth-credentials");
const route_credentials_1 = require("./route-credentials");
const attempt_recording_capture_1 = require("./attempt-recording-capture");
const credential_rejection_cooldown_1 = require("./credential-rejection-cooldown");
const RATE_LIMIT_COOLDOWN_DEFAULT_MS = 15_000;
const RATE_LIMIT_COOLDOWN_MAX_MS = 5 * 60_000;
const MAX_RATE_LIMIT_COOLDOWNS = 2_000;
const PROVIDER_ATTEMPT_REF = Symbol('providerAttemptRef');
function attemptFromError(error) {
    return error instanceof Error ? error[PROVIDER_ATTEMPT_REF] : undefined;
}
let ProxyFallbackService = ProxyFallbackService_1 = class ProxyFallbackService {
    providerKeyService;
    customProviderRepo;
    openaiOauth;
    minimaxOauth;
    anthropicOauth;
    geminiOauth;
    kiroOauth;
    xaiOauth;
    providerClient;
    copilotToken;
    pricingCache;
    modelParamsService;
    providerParamSpecs;
    reasoningCache;
    autofixService;
    logger = new common_1.Logger(ProxyFallbackService_1.name);
    rateLimitCooldowns = new Map();
    credentialRejections = new credential_rejection_cooldown_1.CredentialRejectionCooldown();
    constructor(providerKeyService, customProviderRepo, openaiOauth, minimaxOauth, anthropicOauth, geminiOauth, kiroOauth, xaiOauth, providerClient, copilotToken, pricingCache, modelParamsService, providerParamSpecs, reasoningCache, autofixService) {
        this.providerKeyService = providerKeyService;
        this.customProviderRepo = customProviderRepo;
        this.openaiOauth = openaiOauth;
        this.minimaxOauth = minimaxOauth;
        this.anthropicOauth = anthropicOauth;
        this.geminiOauth = geminiOauth;
        this.kiroOauth = kiroOauth;
        this.xaiOauth = xaiOauth;
        this.providerClient = providerClient;
        this.copilotToken = copilotToken;
        this.pricingCache = pricingCache;
        this.modelParamsService = modelParamsService;
        this.providerParamSpecs = providerParamSpecs;
        this.reasoningCache = reasoningCache;
        this.autofixService = autofixService;
    }
    async applyParamMerge(body, ctx, provider, authType, model) {
        if (!ctx || !authType)
            return body;
        const modelParams = await this.modelParamsService.get(ctx.agentId, ctx.scopeKey, provider, authType, model);
        const specs = await this.providerParamSpecs.getSpecs(provider, authType, model);
        return (0, manifest_shared_1.applyRequestParamDefaults)(body, modelParams, specs);
    }
    async tryFallbacks(agentId, tenantId, fallbackModels, body, stream, sessionKey, primaryModel, signal, primaryProvider, primaryAuthType, signatureLookup, thinkingLookup, apiMode, resolveChatBody, fallbackRoutes, paramMergeContext, startProviderAttempt, credentialDashboardUrl, providerCacheKey, reasoningCacheKey, clientAnthropicBeta) {
        const failures = [];
        const failedAuthByProvider = new Map();
        if (primaryProvider && primaryAuthType) {
            failedAuthByProvider.set(primaryProvider.toLowerCase(), new Set([primaryAuthType]));
        }
        const useStructuredRoutes = Array.isArray(fallbackRoutes) && fallbackRoutes.length === fallbackModels.length;
        for (let i = 0; i < fallbackModels.length; i++) {
            const requestedModel = fallbackModels[i];
            const route = useStructuredRoutes ? fallbackRoutes[i] : null;
            let provider;
            let authType;
            let providerKeyLabel = route?.keyLabel ?? undefined;
            if (route) {
                provider = route.provider;
                authType = route.authType;
            }
            else {
                const pricing = this.pricingCache.getByModel(requestedModel);
                if (custom_provider_service_1.CustomProviderService.isCustom(requestedModel)) {
                    const slashIdx = requestedModel.indexOf('/');
                    provider = slashIdx > 0 ? requestedModel.substring(0, slashIdx) : requestedModel;
                }
                else {
                    const prefix = (0, provider_aliases_1.inferProviderFromModelName)(requestedModel);
                    provider =
                        (prefix && (await this.providerKeyService.hasActiveProvider(tenantId, prefix, agentId))
                            ? prefix
                            : undefined) ??
                            pricing?.provider ??
                            (await this.providerKeyService.findProviderForModel(tenantId, requestedModel, agentId));
                }
                if (!provider) {
                    this.logger.debug(`Fallback ${i}: skipping model=${requestedModel} (no provider data)`);
                    continue;
                }
                const excludeAuth = failedAuthByProvider.get(provider.toLowerCase());
                authType = (await this.providerKeyService.getAuthType(tenantId, provider, excludeAuth, agentId));
            }
            const model = (0, anthropic_model_id_1.normalizeProviderModel)(provider, requestedModel);
            const credentials = await (0, route_credentials_1.resolveRouteCredentials)(this.routeCredentialDeps(), {
                agentId,
                tenantId,
                provider,
                authType,
                providerKeyLabel,
            });
            if (!credentials.ok) {
                this.logger.debug(`Fallback ${i}: credential failure model=${model} provider=${provider} reason=${credentials.reason}`);
                failures.push((0, route_credentials_1.buildCredentialFailureFallback)({
                    model,
                    provider,
                    fallbackIndex: i,
                    authType,
                    tenantProviderId: credentials.tenantProviderId,
                    keyLabel: providerKeyLabel,
                    presentation: (0, route_credentials_1.presentCredentialFailure)(credentials.reason, provider, credentialDashboardUrl ?? 'the dashboard'),
                    startProviderAttempt,
                }));
                continue;
            }
            providerKeyLabel = credentials.keyLabel;
            const tenantProviderId = credentials.tenantProviderId;
            this.logger.log(`Fallback ${i}: trying model=${model} provider=${provider} auth_type=${authType} (primary=${primaryModel})`);
            const forward = await this.warmUpStreamBody(await this.tryForwardToProvider({
                provider,
                apiKey: credentials.apiKey,
                model,
                body,
                resolveChatBody,
                stream,
                sessionKey,
                reasoningCacheKey,
                providerCacheKey,
                signal,
                agentId,
                tenantId,
                rawApiKey: credentials.rawApiKey,
                providerKeyLabel,
                authType,
                apiMode,
                resourceUrl: credentials.resourceUrl,
                providerRegion: credentials.providerRegion,
                signatureLookup,
                thinkingLookup,
                clientAnthropicBeta,
                paramMergeContext,
                tenantProviderId,
                startProviderAttempt,
            }), { stream, provider, model });
            let autofixAttempt = null;
            let preHealErrorBody = null;
            const fallbackApiMode = forward.wireApiMode ?? apiMode;
            if (!forward.response.ok &&
                this.autofixService.isRepairable(forward.response.status) &&
                forward.wireRequestBody &&
                forward.retryWireBody &&
                fallbackApiMode) {
                preHealErrorBody = await forward.response.clone().text();
                autofixAttempt = await this.maybeHealFallback({
                    forward,
                    requestBody: forward.wireRequestBody,
                    apiMode: fallbackApiMode,
                    agentId,
                    tenantId,
                    provider,
                    model,
                    authType,
                    tenantProviderId,
                    providerKeyLabel,
                    signal,
                    startProviderAttempt,
                    stream,
                });
            }
            const finalForward = autofixAttempt?.forward ?? forward;
            const retrySent = autofixAttempt
                ? (0, autofix_types_1.getAutofixRetry)(autofixAttempt.record) !== undefined
                : false;
            const originalFailure = () => ({
                model,
                provider,
                fallbackIndex: i,
                status: forward.response.status,
                errorBody: preHealErrorBody,
                authType,
                tenantProviderId,
                keyLabel: providerKeyLabel,
                attempt: forward.attempt,
                providerCallStarted: forward.providerCallStarted,
                autofix: autofixAttempt?.record,
                autofixRole: 'original',
            });
            if (finalForward.response.ok) {
                if (retrySent)
                    failures.push(originalFailure());
                return {
                    success: {
                        forward: finalForward,
                        model,
                        provider,
                        fallbackIndex: i,
                        authType,
                        keyLabel: providerKeyLabel,
                        tenantProviderId,
                        autofix: retrySent ? autofixAttempt?.record : undefined,
                    },
                    failures,
                };
            }
            const errorBody = await finalForward.response.text();
            await finalForward.attempt?.finishRecording?.((0, attempt_recording_capture_1.recordingResponseFromText)(errorBody));
            if (retrySent)
                failures.push(originalFailure());
            failures.push({
                model,
                provider,
                fallbackIndex: i,
                status: finalForward.response.status,
                errorBody,
                authType,
                tenantProviderId,
                keyLabel: providerKeyLabel,
                attempt: finalForward.attempt,
                providerCallStarted: finalForward.providerCallStarted,
                ...(autofixAttempt
                    ? { autofix: autofixAttempt.record, autofixRole: retrySent ? 'retry' : 'original' }
                    : {}),
            });
            const existing = failedAuthByProvider.get(provider.toLowerCase());
            const updated = new Set(existing);
            updated.add(authType);
            failedAuthByProvider.set(provider.toLowerCase(), updated);
            if (!(0, fallback_status_codes_1.shouldTriggerFallback)(forward.response.status))
                break;
        }
        return { success: null, failures };
    }
    async maybeHealFallback(input) {
        return this.autofixService.maybeHeal({
            forward: input.forward,
            agentId: input.agentId,
            tenantId: input.tenantId,
            provider: input.provider,
            model: input.model,
            authType: input.authType,
            apiMode: input.apiMode,
            requestBody: input.requestBody,
            reforward: async (healedBody) => this.warmUpStreamBody(await this.retryWireBody(input.forward, healedBody, {
                provider: input.provider,
                model: input.model,
                authType: input.authType,
                agentId: input.agentId,
                tenantProviderId: input.tenantProviderId,
                providerKeyLabel: input.providerKeyLabel,
                startProviderAttempt: input.startProviderAttempt,
                signal: input.signal,
                stream: input.stream,
            }), input),
        });
    }
    async warmUpStreamBody(forward, opts) {
        const { response, attempt } = forward;
        if (!opts.stream || !response.ok || !response.body)
            return forward;
        const warmup = await (0, stream_warmup_1.peekStream)(response.body, stream_warmup_1.STREAM_WARMUP_MS);
        if (warmup.ok) {
            return {
                ...forward,
                response: new Response(warmup.stream, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                }),
            };
        }
        if (attempt)
            attempt.completedAtMs = Date.now();
        this.logger.warn(`Fallback stream warmup failed: provider=${opts.provider} model=${opts.model} reason=${warmup.reason} message=${warmup.message}`);
        return {
            ...forward,
            response: new Response(JSON.stringify({ error: { message: `Stream warmup failed: ${warmup.message}` } }), { status: 502, headers: { 'content-type': 'application/json' } }),
        };
    }
    routeCredentialDeps() {
        return {
            providerKeyService: this.providerKeyService,
            oauth: {
                openaiOauth: this.openaiOauth,
                minimaxOauth: this.minimaxOauth,
                anthropicOauth: this.anthropicOauth,
                geminiOauth: this.geminiOauth,
                kiroOauth: this.kiroOauth,
                xaiOauth: this.xaiOauth,
            },
        };
    }
    async tryForwardToProvider(opts) {
        const cooldown = this.getActiveRateLimitCooldown(opts);
        if (cooldown) {
            return this.buildRateLimitCooldownForward(opts, cooldown);
        }
        const rejectedUntil = this.credentialRejections.rejectedUntil(this.credentialRef(opts, opts.apiKey));
        if (rejectedUntil) {
            return this.buildCredentialRejectedForward(opts, rejectedUntil);
        }
        try {
            const forward = await this.forwardToProvider(opts);
            const { forward: result, apiKey } = await this.retryOAuthSubscriptionAfterRejectedToken(opts, forward);
            this.recordRateLimitCooldown(opts, result.response);
            if (result.response.status === 401) {
                this.credentialRejections.reject(this.credentialRef(opts, apiKey));
            }
            return await this.bufferNonStreamBody(result, opts);
        }
        catch (error) {
            if (opts.signal?.aborted)
                throw error;
            if (!(0, proxy_transport_1.isTransportError)(error))
                throw error;
            const failureResponse = (0, proxy_transport_1.buildTransportErrorResponse)(error);
            const message = (0, proxy_transport_1.describeTransportError)(error);
            this.logger.warn(`Provider transport failure: provider=${opts.provider} model=${opts.model} status=${failureResponse.status} message=${message}`);
            return {
                response: failureResponse,
                attempt: attemptFromError(error),
                providerCallStarted: true,
                isGoogle: false,
                isAnthropic: false,
                isChatGpt: false,
            };
        }
    }
    async bufferNonStreamBody(forward, opts) {
        const { response, attempt } = forward;
        if (opts.stream !== false || !response.ok || !response.body)
            return forward;
        try {
            const body = await response.arrayBuffer();
            if (attempt)
                attempt.completedAtMs = Date.now();
            return {
                ...forward,
                response: new Response(body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                }),
            };
        }
        catch (error) {
            if (attempt)
                attempt.completedAtMs = Date.now();
            if (opts.signal?.aborted || !(0, proxy_transport_1.isTransportError)(error)) {
                if (attempt && error instanceof Error) {
                    error[PROVIDER_ATTEMPT_REF] = attempt;
                }
                throw error;
            }
            const failureResponse = (0, proxy_transport_1.buildTransportErrorResponse)(error);
            this.logger.warn(`Provider body read failure: provider=${opts.provider} model=${opts.model} status=${failureResponse.status} message=${(0, proxy_transport_1.describeTransportError)(error)}`);
            return { ...forward, response: failureResponse, providerCallStarted: true };
        }
    }
    async retryWireBody(forward, healedBody, opts) {
        if (!forward.retryWireBody) {
            throw new Error('Provider forward does not support wire-body retry');
        }
        if (!opts)
            return forward.retryWireBody(healedBody);
        const attempt = opts.startProviderAttempt?.({
            provider: opts.provider,
            model: opts.model,
            authType: opts.authType,
            tenantProviderId: opts.tenantProviderId,
            keyLabel: opts.providerKeyLabel,
        });
        try {
            const retried = await forward.retryWireBody(healedBody, attempt);
            if (attempt)
                attempt.completedAtMs = Date.now();
            this.recordRateLimitCooldownForKey(this.rateLimitCooldownKey({
                agentId: opts.agentId,
                authType: opts.authType,
                provider: opts.provider,
                providerKeyLabel: opts.providerKeyLabel,
                model: opts.model,
            }), retried.response);
            return await this.bufferNonStreamBody({ ...retried, attempt, providerCallStarted: true }, opts);
        }
        catch (error) {
            if (attempt)
                attempt.completedAtMs = Date.now();
            if (attempt && error instanceof Error) {
                error[PROVIDER_ATTEMPT_REF] = attempt;
            }
            if (opts.signal?.aborted || !(0, proxy_transport_1.isTransportError)(error))
                throw error;
            const failureResponse = (0, proxy_transport_1.buildTransportErrorResponse)(error);
            const message = (0, proxy_transport_1.describeTransportError)(error);
            this.logger.warn(`Provider transport failure: provider=${opts.provider} model=${opts.model} status=${failureResponse.status} message=${message}`);
            return {
                response: failureResponse,
                attempt,
                providerCallStarted: true,
                isGoogle: false,
                isAnthropic: false,
                isChatGpt: false,
            };
        }
    }
    getActiveRateLimitCooldown(opts) {
        const key = this.rateLimitCooldownKey(opts);
        if (!key)
            return null;
        const expiresAt = this.rateLimitCooldowns.get(key);
        if (!expiresAt)
            return null;
        if (expiresAt <= Date.now()) {
            this.rateLimitCooldowns.delete(key);
            return null;
        }
        return expiresAt;
    }
    buildRateLimitCooldownForward(opts, expiresAt) {
        const message = `Provider route temporarily cooling down after an upstream 429: ` +
            `${opts.provider}/${opts.model}`;
        return this.buildLocalSkipForward(opts, 429, message, expiresAt);
    }
    buildCredentialRejectedForward(opts, expiresAt) {
        const credential = opts.providerKeyLabel ? `"${opts.providerKeyLabel}" ` : '';
        const message = `${opts.provider} rejected the ${credential}credential with a 401 and it is skipped ` +
            `for now. Reconnect or replace it if this continues.`;
        return this.buildLocalSkipForward(opts, 401, message, expiresAt);
    }
    buildLocalSkipForward(opts, status, message, expiresAt) {
        const attempt = opts.startProviderAttempt?.({
            provider: opts.provider,
            model: opts.model,
            authType: opts.authType,
            tenantProviderId: opts.tenantProviderId,
            keyLabel: opts.providerKeyLabel,
            providerCallStarted: false,
        });
        if (attempt)
            attempt.completedAtMs = Date.now();
        const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
        return {
            response: new Response(JSON.stringify({ error: { message } }), {
                status,
                headers: {
                    'content-type': 'application/json',
                    'retry-after': String(retryAfterSeconds),
                },
            }),
            isGoogle: false,
            isAnthropic: false,
            isChatGpt: false,
            providerCallStarted: false,
            attempt,
        };
    }
    credentialRef(opts, secret) {
        return {
            tenantId: opts.tenantId,
            connectionId: opts.tenantProviderId,
            provider: opts.provider,
            authType: opts.authType,
            keyLabel: opts.providerKeyLabel,
            model: opts.model,
            secret,
        };
    }
    recordRateLimitCooldown(opts, response) {
        this.recordRateLimitCooldownForKey(this.rateLimitCooldownKey(opts), response);
    }
    recordRateLimitCooldownForKey(key, response) {
        if (response.status !== 429 || !key)
            return;
        if (this.rateLimitCooldowns.size >= MAX_RATE_LIMIT_COOLDOWNS) {
            this.evictExpiredRateLimitCooldowns();
            if (this.rateLimitCooldowns.size >= MAX_RATE_LIMIT_COOLDOWNS) {
                this.evictOldestRateLimitCooldown();
            }
        }
        const ttlMs = this.parseRetryAfterMs(response.headers.get('retry-after'));
        this.rateLimitCooldowns.set(key, Date.now() + ttlMs);
    }
    evictExpiredRateLimitCooldowns(now = Date.now()) {
        for (const [key, expiresAt] of this.rateLimitCooldowns) {
            if (expiresAt <= now)
                this.rateLimitCooldowns.delete(key);
        }
    }
    evictOldestRateLimitCooldown() {
        let oldestKey = null;
        let oldestExpiresAt = Number.POSITIVE_INFINITY;
        for (const [key, expiresAt] of this.rateLimitCooldowns) {
            if (expiresAt >= oldestExpiresAt)
                continue;
            oldestKey = key;
            oldestExpiresAt = expiresAt;
        }
        if (oldestKey)
            this.rateLimitCooldowns.delete(oldestKey);
    }
    parseRetryAfterMs(retryAfter) {
        if (!retryAfter)
            return RATE_LIMIT_COOLDOWN_DEFAULT_MS;
        const seconds = Number(retryAfter);
        if (Number.isFinite(seconds) && seconds > 0) {
            return Math.min(seconds * 1000, RATE_LIMIT_COOLDOWN_MAX_MS);
        }
        const retryAt = Date.parse(retryAfter);
        if (Number.isNaN(retryAt))
            return RATE_LIMIT_COOLDOWN_DEFAULT_MS;
        const deltaMs = retryAt - Date.now();
        if (deltaMs <= 0)
            return RATE_LIMIT_COOLDOWN_DEFAULT_MS;
        return Math.min(deltaMs, RATE_LIMIT_COOLDOWN_MAX_MS);
    }
    rateLimitCooldownKey(opts) {
        if (!opts.agentId || !opts.authType)
            return null;
        return [
            opts.agentId,
            opts.provider.toLowerCase(),
            opts.authType,
            opts.providerKeyLabel ?? '',
            opts.model.toLowerCase(),
        ].join('\u0000');
    }
    async retryOAuthSubscriptionAfterRejectedToken(opts, forward) {
        const unchanged = { forward, apiKey: opts.apiKey };
        if (opts.authType !== 'subscription' ||
            forward.response.status !== 401 ||
            !opts.rawApiKey ||
            !opts.agentId ||
            !opts.tenantId) {
            return unchanged;
        }
        const refreshed = await (0, oauth_credentials_1.refreshRejectedOAuthCredential)(opts.provider, opts.rawApiKey, opts.agentId, opts.tenantId, opts.providerKeyLabel, {
            openaiOauth: this.openaiOauth,
            minimaxOauth: this.minimaxOauth,
            anthropicOauth: this.anthropicOauth,
            geminiOauth: this.geminiOauth,
            kiroOauth: this.kiroOauth,
            xaiOauth: this.xaiOauth,
        });
        if (!refreshed?.apiKey || refreshed.apiKey === opts.apiKey) {
            this.logger.warn(`OAuth token rejected upstream and could not be refreshed: provider=${opts.provider} ` +
                `keyLabel=${opts.providerKeyLabel ?? 'default'} agent=${opts.agentId}`);
            return unchanged;
        }
        this.logger.log(`OAuth token rejected upstream; refreshed provider=${opts.provider} agent=${opts.agentId}`);
        const rejectedBody = await forward.response
            .clone()
            .text()
            .catch(() => 'OAuth token rejected');
        await forward.attempt?.finishRecording?.((0, attempt_recording_capture_1.recordingResponseFromText)(rejectedBody));
        await forward.attempt?.completeFailure?.({
            status: forward.response.status,
            errorBody: rejectedBody,
            superseded: true,
        });
        const retryOpts = {
            ...opts,
            apiKey: refreshed.apiKey,
            resourceUrl: refreshed.resourceUrl ?? opts.resourceUrl,
        };
        try {
            return { forward: await this.forwardToProvider(retryOpts), apiKey: refreshed.apiKey };
        }
        catch (error) {
            if (opts.signal?.aborted || !(0, proxy_transport_1.isTransportError)(error))
                throw error;
            return {
                forward: {
                    response: (0, proxy_transport_1.buildTransportErrorResponse)(error),
                    attempt: attemptFromError(error),
                    providerCallStarted: true,
                    isGoogle: false,
                    isAnthropic: false,
                    isChatGpt: false,
                },
                apiKey: refreshed.apiKey,
            };
        }
    }
    async forwardToProvider(opts) {
        const { provider, stream, signal, authType, resourceUrl, providerRegion, signatureLookup, thinkingLookup, } = opts;
        let body = await this.applyParamMerge(opts.body, opts.paramMergeContext, provider, authType, opts.model);
        const agentScopeKey = opts.tenantId && opts.agentId ? `${opts.tenantId}\u0000${opts.agentId}` : undefined;
        const extraHeaders = (0, provider_hooks_1.buildProviderExtraHeaders)(provider, opts.providerCacheKey, agentScopeKey);
        let effectiveKey = opts.apiKey;
        if (provider.toLowerCase() === 'copilot') {
            effectiveKey = await this.copilotToken.getCopilotToken(opts.apiKey);
        }
        const customProvider = custom_provider_service_1.CustomProviderService.isCustom(provider) && opts.tenantId
            ? await this.customProviderRepo.findOne({
                where: { id: custom_provider_service_1.CustomProviderService.extractId(provider), tenant_id: opts.tenantId },
            })
            : null;
        const { customEndpoint, forwardModel } = (0, forward_endpoint_resolver_1.resolveForwardEndpoint)({
            provider,
            authType,
            model: opts.model,
            providerRegion,
            resourceUrl,
            customProvider,
            logger: this.logger,
            apiMode: opts.apiMode,
        });
        const reasoningEndpointKey = customEndpoint && customEndpoint.format !== 'openai'
            ? null
            : customEndpoint
                ? 'custom'
                : (0, provider_endpoints_1.resolveEndpointKey)(provider);
        let resolvedChatBody;
        const resolveChatBody = opts.resolveChatBody
            ? () => {
                resolvedChatBody ??= (async () => {
                    let resolved = await opts.resolveChatBody();
                    resolved = await this.applyParamMerge(resolved, opts.paramMergeContext, provider, authType, opts.model);
                    resolved = await this.reasoningCache.prepareRequest(resolved, opts.reasoningCacheKey ?? opts.sessionKey, reasoningEndpointKey, forwardModel);
                    return resolved;
                })();
                return resolvedChatBody;
            }
            : undefined;
        body = await this.reasoningCache.prepareRequest(body, opts.reasoningCacheKey ?? opts.sessionKey, reasoningEndpointKey, forwardModel);
        const providerResource = authType === 'subscription' && provider.toLowerCase() === 'gemini' ? resourceUrl : undefined;
        const attempt = opts.startProviderAttempt?.({
            provider,
            model: opts.model,
            authType,
            tenantProviderId: opts.tenantProviderId,
            keyLabel: opts.providerKeyLabel,
        });
        try {
            const forward = await this.providerClient.forward({
                provider,
                apiKey: effectiveKey,
                model: forwardModel,
                body,
                resolveChatBody,
                stream,
                signal,
                extraHeaders,
                customEndpoint,
                authType,
                apiMode: opts.apiMode,
                sessionKey: opts.sessionKey,
                providerCacheKey: opts.providerCacheKey,
                signatureLookup,
                thinkingLookup,
                ...(thinkingLookup
                    ? {
                        thinkingRouteContext: {
                            provider,
                            authType,
                            model: opts.model,
                        },
                    }
                    : {}),
                clientAnthropicBeta: opts.clientAnthropicBeta,
                providerResource,
                attempt,
            });
            if (attempt)
                attempt.completedAtMs = Date.now();
            return { ...forward, attempt, providerCallStarted: true };
        }
        catch (error) {
            if (attempt)
                attempt.completedAtMs = Date.now();
            if (attempt && error instanceof Error) {
                error[PROVIDER_ATTEMPT_REF] = attempt;
            }
            throw error;
        }
    }
};
exports.ProxyFallbackService = ProxyFallbackService;
exports.ProxyFallbackService = ProxyFallbackService = ProxyFallbackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(custom_provider_entity_1.CustomProvider)),
    __metadata("design:paramtypes", [provider_key_service_1.ProviderKeyService,
        typeorm_2.Repository,
        openai_oauth_service_1.OpenaiOauthService,
        minimax_oauth_service_1.MinimaxOauthService,
        anthropic_oauth_service_1.AnthropicOauthService,
        gemini_oauth_service_1.GeminiOauthService,
        kiro_oauth_service_1.KiroOauthService,
        xai_oauth_service_1.XaiOauthService,
        provider_client_1.ProviderClient,
        copilot_token_service_1.CopilotTokenService,
        model_pricing_cache_service_1.ModelPricingCacheService,
        agent_model_params_service_1.AgentModelParamsService,
        provider_param_spec_service_1.ProviderParamSpecService,
        reasoning_content_cache_1.ReasoningContentCache,
        autofix_service_1.AutofixService])
], ProxyFallbackService);
//# sourceMappingURL=proxy-fallback.service.js.map