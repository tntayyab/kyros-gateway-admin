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
var ProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resolve_service_1 = require("../resolve/resolve.service");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const provider_key_service_1 = require("../routing-core/provider-key.service");
const openai_oauth_service_1 = require("../oauth/openai/openai-oauth.service");
const minimax_oauth_service_1 = require("../oauth/minimax/minimax-oauth.service");
const anthropic_oauth_service_1 = require("../oauth/anthropic/anthropic-oauth.service");
const gemini_oauth_service_1 = require("../oauth/gemini/gemini-oauth.service");
const kiro_oauth_service_1 = require("../oauth/kiro/kiro-oauth.service");
const xai_oauth_service_1 = require("../oauth/xai/xai-oauth.service");
const session_momentum_service_1 = require("./session-momentum.service");
const limit_check_service_1 = require("../../notifications/services/limit-check.service");
const fallback_status_codes_1 = require("./fallback-status-codes");
const types_1 = require("../../scoring/types");
const manifest_shared_1 = require("manifest-shared");
const proxy_fallback_service_1 = require("./proxy-fallback.service");
const thought_signature_cache_1 = require("./thought-signature-cache");
const thinking_block_cache_1 = require("./thinking-block-cache");
const agent_model_params_service_1 = require("../routing-core/agent-model-params.service");
const provider_param_spec_service_1 = require("../routing-core/provider-param-spec.service");
const proxy_friendly_response_1 = require("./proxy-friendly-response");
const error_codes_1 = require("../../common/errors/error-codes");
const manifest_error_1 = require("../../common/errors/manifest-error");
const route_credentials_1 = require("./route-credentials");
const stream_warmup_1 = require("./stream-warmup");
const responses_adapter_1 = require("./responses-adapter");
const anthropic_messages_adapter_1 = require("./anthropic-messages-adapter");
const response_mode_guard_1 = require("../routing-core/response-mode-guard");
const route_helpers_1 = require("../routing-core/route-helpers");
const openai_model_id_1 = require("./openai-model-id");
const autofix_service_1 = require("../autofix/autofix.service");
const attempt_recording_capture_1 = require("./attempt-recording-capture");
const SCORING_EXCLUDED_ROLES = new Set(['system', 'developer']);
const SCORING_RECENT_MESSAGES = 10;
function warmupFailureForward(forward, message) {
    return {
        ...forward,
        response: new Response(JSON.stringify({ error: { message: `Stream warmup failed: ${message}` } }), { status: 502, headers: { 'content-type': 'application/json' } }),
    };
}
let ProxyService = ProxyService_1 = class ProxyService {
    resolveService;
    modelDiscovery;
    providerKeyService;
    openaiOauth;
    minimaxOauth;
    anthropicOauth;
    geminiOauth;
    kiroOauth;
    xaiOauth;
    momentum;
    limitCheck;
    fallbackService;
    config;
    signatureCache;
    thinkingCache;
    modelParamsService;
    providerParamSpecs;
    autofixService;
    logger = new common_1.Logger(ProxyService_1.name);
    constructor(resolveService, modelDiscovery, providerKeyService, openaiOauth, minimaxOauth, anthropicOauth, geminiOauth, kiroOauth, xaiOauth, momentum, limitCheck, fallbackService, config, signatureCache, thinkingCache, modelParamsService, providerParamSpecs, autofixService) {
        this.resolveService = resolveService;
        this.modelDiscovery = modelDiscovery;
        this.providerKeyService = providerKeyService;
        this.openaiOauth = openaiOauth;
        this.minimaxOauth = minimaxOauth;
        this.anthropicOauth = anthropicOauth;
        this.geminiOauth = geminiOauth;
        this.kiroOauth = kiroOauth;
        this.xaiOauth = xaiOauth;
        this.momentum = momentum;
        this.limitCheck = limitCheck;
        this.fallbackService = fallbackService;
        this.config = config;
        this.signatureCache = signatureCache;
        this.thinkingCache = thinkingCache;
        this.modelParamsService = modelParamsService;
        this.providerParamSpecs = providerParamSpecs;
        this.autofixService = autofixService;
    }
    async proxyRequest(opts) {
        const { agentId, tenantId, body, sessionKey, sessionCacheKey, providerCacheKey, sessionMomentumKey, agentName, signal, specificityOverride, headers, startProviderAttempt, } = opts;
        const apiMode = opts.apiMode ?? 'chat_completions';
        const routingSource = opts.routingBody ?? body;
        const resolveChatBody = this.createChatBodyResolver(apiMode, body);
        const resolveRoutingChatBody = routingSource === body
            ? resolveChatBody
            : this.createChatBodyResolver(apiMode, routingSource);
        this.validatePayload(body, apiMode);
        if (routingSource !== body)
            this.validatePayload(routingSource, apiMode);
        const limitMessage = await this.enforceLimits(tenantId, agentName);
        if (limitMessage) {
            return (0, proxy_friendly_response_1.buildFriendlyResponse)(limitMessage, body.stream === true, 'limit_exceeded', 'M200');
        }
        const resolved = await this.resolveRouting(agentId, tenantId, routingSource, resolveRoutingChatBody, sessionMomentumKey, specificityOverride, headers, apiMode);
        const responseMode = resolved.response_mode ?? manifest_shared_1.DEFAULT_RESPONSE_MODE;
        const stream = body.stream === true || responseMode === 'stream';
        if (!resolved.route) {
            this.logger.warn(`No route available for agent=${agentId}: ` +
                `tier=${resolved.tier} confidence=${resolved.confidence} reason=${resolved.reason}`);
            const unavailableModel = resolved.explicit_model_unavailable ?? resolved.override_model_unavailable;
            if (unavailableModel) {
                return this.buildModelUnavailableResult(stream, agentName, unavailableModel);
            }
            return this.buildNoProviderResult(stream, agentName);
        }
        const route = resolved.route;
        const credentials = await this.resolveCredentials(agentId, tenantId, {
            provider: route.provider,
            auth_type: route.authType,
            provider_key_label: route.keyLabel ?? undefined,
        });
        const primaryModel = (0, proxy_fallback_service_1.normalizeProviderModel)(route.provider, route.model);
        this.logger.log(`Proxy: tier=${resolved.tier} model=${primaryModel} provider=${route.provider} auth_type=${route.authType} confidence=${resolved.confidence}`);
        const { signatureLookup, thinkingLookup } = this.buildCacheLookups(sessionCacheKey);
        const explicitModelOverride = resolved.explicit_model_override === true;
        const scopeKey = (0, manifest_shared_1.modelParamsScopeForRouting)({
            tier: resolved.tier,
            specificityCategory: resolved.specificity_category,
            headerTierId: resolved.header_tier_id,
        });
        const paramMergeContext = explicitModelOverride
            ? undefined
            : { agentId, scopeKey };
        const [primaryModelParams, primarySpecs] = explicitModelOverride
            ? [null, []]
            : await Promise.all([
                this.modelParamsService.get(agentId, scopeKey, route.provider, route.authType, primaryModel),
                this.providerParamSpecs.getSpecs(route.provider, route.authType, primaryModel),
            ]);
        const primaryRequestParams = explicitModelOverride
            ? null
            : (0, manifest_shared_1.snapshotRequestParams)({
                body,
                modelParams: primaryModelParams,
                specs: primarySpecs,
            });
        const dashboardUrl = (0, proxy_friendly_response_1.getDashboardUrl)(this.config, agentName, 'routing');
        if (!credentials.ok) {
            const credentialFailure = (0, route_credentials_1.presentCredentialFailure)(credentials.reason, route.provider, dashboardUrl);
            this.logger.warn(`Primary ${route.provider}/${primaryModel} credentials unusable for ` +
                `agent=${agentId} reason=${credentials.reason}`);
            const willRunChain = !explicitModelOverride &&
                !!paramMergeContext &&
                this.effectiveFallbackRoutes(resolved).length > 0;
            const forward = (0, route_credentials_1.buildCredentialFailureForward)({
                provider: route.provider,
                model: primaryModel,
                authType: route.authType,
                tenantProviderId: credentials.tenantProviderId,
                keyLabel: route.keyLabel ?? undefined,
                presentation: credentialFailure,
                startProviderAttempt: willRunChain ? startProviderAttempt : undefined,
            });
            if (willRunChain && paramMergeContext) {
                const fallbackResult = await this.tryFallbackChain({
                    agentId,
                    tenantId,
                    resolved,
                    primaryModel,
                    forward,
                    body,
                    resolveChatBody,
                    stream,
                    sessionKey,
                    sessionCacheKey,
                    providerCacheKey,
                    sessionMomentumKey,
                    signal,
                    signatureLookup,
                    thinkingLookup,
                    apiMode,
                    paramMergeContext,
                    primaryTenantProviderId: credentials.tenantProviderId,
                    primaryKeyLabel: route.keyLabel ?? undefined,
                    startProviderAttempt,
                    credentialDashboardUrl: dashboardUrl,
                    clientAnthropicBeta: headers?.['anthropic-beta'],
                });
                if (fallbackResult)
                    return fallbackResult;
            }
            return (0, proxy_friendly_response_1.buildFriendlyResponse)(credentialFailure.message, stream, credentialFailure.reason, credentialFailure.code);
        }
        let forward = await this.fallbackService.tryForwardToProvider({
            provider: route.provider,
            apiKey: credentials.apiKey,
            model: primaryModel,
            body,
            resolveChatBody,
            stream,
            sessionKey,
            reasoningCacheKey: sessionCacheKey,
            providerCacheKey,
            signal,
            agentId,
            tenantId,
            rawApiKey: credentials.rawApiKey,
            providerKeyLabel: credentials.keyLabel,
            authType: route.authType,
            apiMode,
            resourceUrl: credentials.resourceUrl,
            providerRegion: credentials.providerRegion,
            signatureLookup,
            thinkingLookup,
            clientAnthropicBeta: headers?.['anthropic-beta'],
            paramMergeContext,
            tenantProviderId: credentials.tenantProviderId,
            startProviderAttempt,
        });
        const autofixOriginalAttempt = forward.attempt;
        const autofixOriginalProviderCallStarted = forward.providerCallStarted;
        const wireRequestBody = forward.wireRequestBody;
        const wireApiMode = forward.wireApiMode;
        const wireFormat = forward.wireFormat;
        const retryWireBody = forward.retryWireBody;
        const autofixApiMode = wireApiMode ?? apiMode;
        const autofixAttempt = wireRequestBody && retryWireBody && (wireApiMode || wireFormat)
            ? await this.autofixService.maybeHeal({
                forward,
                agentId,
                tenantId,
                provider: route.provider,
                model: primaryModel,
                authType: route.authType,
                apiMode: autofixApiMode,
                requestBody: wireRequestBody,
                reforward: (healedBody) => this.reforwardHealed(healedBody, forward, {
                    agentId,
                    tenantId,
                    apiMode: autofixApiMode,
                    sessionKey,
                    sessionCacheKey,
                    providerCacheKey,
                    sessionMomentumKey,
                    signal,
                    stream,
                    specificityOverride,
                    headers,
                    provider: route.provider,
                    apiKey: credentials.apiKey,
                    rawApiKey: credentials.rawApiKey,
                    model: primaryModel,
                    keyLabel: credentials.keyLabel,
                    authType: route.authType,
                    resourceUrl: credentials.resourceUrl,
                    providerRegion: credentials.providerRegion,
                    paramMergeContext,
                    signatureLookup,
                    thinkingLookup,
                    tenantProviderId: credentials.tenantProviderId,
                    startProviderAttempt,
                }),
            })
            : null;
        const autofixRecord = autofixAttempt?.record;
        if (autofixAttempt)
            forward = autofixAttempt.forward;
        if (!explicitModelOverride &&
            !forward.response.ok &&
            (0, fallback_status_codes_1.shouldTriggerFallback)(forward.response.status) &&
            paramMergeContext) {
            const fallbackResult = await this.tryFallbackChain({
                agentId,
                tenantId,
                resolved,
                primaryModel,
                forward,
                body,
                resolveChatBody,
                stream,
                sessionKey,
                sessionCacheKey,
                providerCacheKey,
                sessionMomentumKey,
                signal,
                signatureLookup,
                thinkingLookup,
                apiMode,
                paramMergeContext,
                primaryTenantProviderId: credentials.tenantProviderId,
                primaryKeyLabel: credentials.keyLabel,
                startProviderAttempt,
                credentialDashboardUrl: dashboardUrl,
                clientAnthropicBeta: headers?.['anthropic-beta'],
            });
            if (fallbackResult) {
                return {
                    ...fallbackResult,
                    meta: {
                        ...fallbackResult.meta,
                        autofixOriginalAttempt,
                        autofixOriginalProviderCallStarted,
                    },
                    autofix: autofixRecord,
                };
            }
        }
        if (forward.response.ok && stream && forward.response.body) {
            const warmup = await (0, stream_warmup_1.peekStream)(forward.response.body, stream_warmup_1.STREAM_WARMUP_MS);
            if (warmup.ok) {
                const peeked = {
                    response: new Response(warmup.stream, {
                        status: forward.response.status,
                        statusText: forward.response.statusText,
                        headers: forward.response.headers,
                    }),
                    attempt: forward.attempt,
                    isGoogle: forward.isGoogle,
                    isAnthropic: forward.isAnthropic,
                    isChatGpt: forward.isChatGpt,
                    isResponses: forward.isResponses,
                    isCodeAssist: forward.isCodeAssist,
                    responsesTextFormat: forward.responsesTextFormat,
                    responsesToolNames: forward.responsesToolNames,
                    wireRequestBody: forward.wireRequestBody,
                    wireRequestUrl: forward.wireRequestUrl,
                    wireFormat: forward.wireFormat,
                    wireApiMode: forward.wireApiMode,
                    retryWireBody: forward.retryWireBody,
                    providerCallStarted: forward.providerCallStarted,
                };
                this.recordTierIfScoring(sessionMomentumKey, resolved.tier);
                this.recordCategoryIfValid(sessionMomentumKey, resolved.specificity_category);
                return {
                    forward: peeked,
                    meta: this.buildBaseMeta(resolved, primaryModel, {
                        request_params: primaryRequestParams,
                        tenantProviderId: credentials.tenantProviderId,
                        provider_key_label: credentials.keyLabel,
                        attempt: forward.attempt,
                        providerCallStarted: forward.providerCallStarted,
                        autofixOriginalAttempt,
                        autofixOriginalProviderCallStarted,
                    }),
                    autofix: autofixRecord,
                };
            }
            this.logger.warn(`Stream warmup failed: provider=${route.provider} model=${primaryModel} reason=${warmup.reason} message=${warmup.message}`);
            const syntheticForward = warmupFailureForward(forward, warmup.message);
            if (!explicitModelOverride && paramMergeContext) {
                const fallbackResult = await this.tryFallbackChain({
                    agentId,
                    tenantId,
                    resolved,
                    primaryModel,
                    forward: syntheticForward,
                    body,
                    resolveChatBody,
                    stream,
                    sessionKey,
                    sessionCacheKey,
                    providerCacheKey,
                    sessionMomentumKey,
                    signal,
                    signatureLookup,
                    thinkingLookup,
                    apiMode,
                    paramMergeContext,
                    primaryTenantProviderId: credentials.tenantProviderId,
                    primaryKeyLabel: credentials.keyLabel,
                    startProviderAttempt,
                    credentialDashboardUrl: dashboardUrl,
                    clientAnthropicBeta: headers?.['anthropic-beta'],
                });
                if (fallbackResult) {
                    return {
                        ...fallbackResult,
                        meta: {
                            ...fallbackResult.meta,
                            autofixOriginalAttempt,
                            autofixOriginalProviderCallStarted,
                        },
                        autofix: autofixRecord,
                    };
                }
            }
            this.recordTierIfScoring(sessionMomentumKey, resolved.tier);
            this.recordCategoryIfValid(sessionMomentumKey, resolved.specificity_category);
            return {
                forward: syntheticForward,
                meta: this.buildBaseMeta(resolved, primaryModel, {
                    request_params: primaryRequestParams,
                    tenantProviderId: credentials.tenantProviderId,
                    provider_key_label: credentials.keyLabel,
                    attempt: forward.attempt,
                    providerCallStarted: forward.providerCallStarted,
                    autofixOriginalAttempt,
                    autofixOriginalProviderCallStarted,
                }),
                autofix: autofixRecord,
            };
        }
        this.recordTierIfScoring(sessionMomentumKey, resolved.tier);
        this.recordCategoryIfValid(sessionMomentumKey, resolved.specificity_category);
        return {
            forward,
            meta: this.buildBaseMeta(resolved, primaryModel, {
                request_params: primaryRequestParams,
                tenantProviderId: credentials.tenantProviderId,
                provider_key_label: credentials.keyLabel,
                attempt: forward.attempt,
                providerCallStarted: forward.providerCallStarted,
                autofixOriginalAttempt,
                autofixOriginalProviderCallStarted,
            }),
            autofix: autofixRecord,
        };
    }
    recordTierIfScoring(sessionKey, tier) {
        if (!sessionKey)
            return;
        if (types_1.TIERS.includes(tier)) {
            this.momentum.recordTier(sessionKey, tier);
        }
    }
    toChatBody(apiMode, body) {
        if (apiMode === 'responses')
            return (0, responses_adapter_1.toChatCompletionsRequest)(body);
        if (apiMode === 'messages')
            return (0, anthropic_messages_adapter_1.messagesToChatCompletionsRequest)(body);
        return undefined;
    }
    async reforwardHealed(healedBody, originalForward, ctx) {
        const retry = await this.sendHealedRetry(healedBody, originalForward, ctx);
        if (!ctx.stream || !retry.response.ok || !retry.response.body)
            return retry;
        const warmup = await (0, stream_warmup_1.peekStream)(retry.response.body, stream_warmup_1.STREAM_WARMUP_MS);
        if (!warmup.ok) {
            this.logger.warn(`Autofix retry stream warmup failed: provider=${ctx.provider} model=${ctx.model} ` +
                `reason=${warmup.reason} message=${warmup.message}`);
            return warmupFailureForward(retry, warmup.message);
        }
        return {
            ...retry,
            response: new Response(warmup.stream, {
                status: retry.response.status,
                statusText: retry.response.statusText,
                headers: retry.response.headers,
            }),
        };
    }
    sendHealedRetry(healedBody, originalForward, ctx) {
        const originalModel = originalForward.wireRequestBody?.model;
        const healedModel = typeof healedBody.model === 'string' ? healedBody.model : undefined;
        if (healedModel && healedModel !== originalModel) {
            const routingBody = ctx.authType === 'subscription'
                ? {
                    ...healedBody,
                    model: (0, openai_model_id_1.subscriptionOpenAiModelId)(ctx.provider, healedModel),
                }
                : healedBody;
            return this.forwardResolvedHealed(routingBody, healedBody, originalForward, ctx);
        }
        return this.fallbackService.retryWireBody(originalForward, healedBody, {
            provider: ctx.provider,
            model: ctx.model,
            signal: ctx.signal,
            stream: ctx.stream,
            authType: ctx.authType,
            agentId: ctx.agentId,
            tenantProviderId: ctx.tenantProviderId,
            providerKeyLabel: ctx.keyLabel,
            startProviderAttempt: ctx.startProviderAttempt,
        });
    }
    async forwardResolvedHealed(routingBody, healedBody, originalForward, ctx) {
        const resolveChatBody = this.createChatBodyResolver(ctx.apiMode, healedBody);
        const resolveRoutingChatBody = routingBody === healedBody
            ? resolveChatBody
            : this.createChatBodyResolver(ctx.apiMode, routingBody);
        const resolved = await this.resolveRouting(ctx.agentId, ctx.tenantId, routingBody, resolveRoutingChatBody, ctx.sessionMomentumKey, ctx.specificityOverride, ctx.headers, ctx.apiMode);
        const route = resolved.route;
        if (!route) {
            return this.retryHealedOnOriginalTransport(healedBody, originalForward, ctx, 'no route resolved for the healed model');
        }
        const credentials = await this.resolveCredentials(ctx.agentId, ctx.tenantId, {
            provider: route.provider,
            auth_type: route.authType,
            provider_key_label: route.keyLabel ?? undefined,
        });
        if (!credentials.ok) {
            return this.retryHealedOnOriginalTransport(healedBody, originalForward, ctx, 'no provider key for the healed model');
        }
        const model = (0, proxy_fallback_service_1.normalizeProviderModel)(route.provider, route.model);
        const explicitModelOverride = resolved.explicit_model_override === true;
        const scopeKey = (0, manifest_shared_1.modelParamsScopeForRouting)({
            tier: resolved.tier,
            specificityCategory: resolved.specificity_category,
            headerTierId: resolved.header_tier_id,
        });
        return this.fallbackService.tryForwardToProvider({
            provider: route.provider,
            apiKey: credentials.apiKey,
            model,
            body: healedBody,
            resolveChatBody,
            stream: ctx.stream,
            sessionKey: ctx.sessionKey,
            reasoningCacheKey: ctx.sessionCacheKey,
            providerCacheKey: ctx.providerCacheKey,
            signal: ctx.signal,
            agentId: ctx.agentId,
            tenantId: ctx.tenantId,
            rawApiKey: credentials.rawApiKey,
            providerKeyLabel: credentials.keyLabel,
            authType: route.authType,
            apiMode: ctx.apiMode,
            resourceUrl: credentials.resourceUrl,
            providerRegion: credentials.providerRegion,
            signatureLookup: ctx.signatureLookup,
            thinkingLookup: ctx.thinkingLookup,
            clientAnthropicBeta: ctx.headers?.['anthropic-beta'],
            paramMergeContext: explicitModelOverride ? undefined : { agentId: ctx.agentId, scopeKey },
            tenantProviderId: credentials.tenantProviderId,
            startProviderAttempt: ctx.startProviderAttempt,
        });
    }
    retryHealedOnOriginalTransport(healedBody, originalForward, ctx, reason) {
        if (!originalForward.retryWireBody) {
            return Promise.resolve(this.autofixReforwardError(reason));
        }
        const healedModel = typeof healedBody.model === 'string' ? healedBody.model : ctx.model;
        return this.fallbackService.retryWireBody(originalForward, healedBody, {
            provider: ctx.provider,
            model: healedModel,
            signal: ctx.signal,
            stream: ctx.stream,
            authType: ctx.authType,
            tenantProviderId: ctx.tenantProviderId,
            providerKeyLabel: ctx.keyLabel,
            startProviderAttempt: ctx.startProviderAttempt,
        });
    }
    autofixReforwardError(reason) {
        return {
            response: new Response(JSON.stringify({ error: { message: `Autofix: ${reason}` } }), {
                status: 502,
                headers: { 'content-type': 'application/json' },
            }),
            isGoogle: false,
            isAnthropic: false,
            isChatGpt: false,
            isResponses: false,
            isCodeAssist: false,
        };
    }
    validatePayload(body, apiMode) {
        if (apiMode === 'responses') {
            const hasInstructions = typeof body.instructions === 'string' && body.instructions.trim().length > 0;
            const hasInput = typeof body.input === 'string' ||
                (Array.isArray(body.input) &&
                    body.input.some((item) => typeof item === 'string' ||
                        (!!item && typeof item === 'object' && !Array.isArray(item))));
            if (hasInstructions || hasInput)
                return;
            throw new manifest_error_1.ManifestError('M300', common_1.HttpStatus.BAD_REQUEST);
        }
        const messages = body.messages;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new manifest_error_1.ManifestError('M300', common_1.HttpStatus.BAD_REQUEST);
        }
        if (apiMode === 'chat_completions') {
            sanitizeNullContent(messages);
        }
    }
    createChatBodyResolver(apiMode, body) {
        if (apiMode === 'chat_completions')
            return undefined;
        let resolved;
        return () => {
            resolved ??= Promise.resolve(this.toChatBody(apiMode, body));
            return resolved;
        };
    }
    async resolveRouting(agentId, tenantId, body, resolveChatBody, sessionMomentumKey, specificityOverride, headers, apiMode) {
        const requestedModel = typeof body.model === 'string' ? body.model : undefined;
        if (requestedModel && requestedModel !== openai_model_id_1.OPENAI_MODEL_ID_AUTO) {
            const explicit = await this.resolveExplicitModel(agentId, tenantId, requestedModel, headers);
            if (explicit)
                return explicit;
            return {
                tier: 'default',
                route: null,
                fallback_routes: null,
                response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
                confidence: 0,
                score: 0,
                reason: 'default',
                explicit_model_unavailable: requestedModel,
            };
        }
        const isHeartbeat = this.detectHeartbeatBody(body, apiMode);
        const recentTiers = sessionMomentumKey
            ? this.momentum.getRecentTiers(sessionMomentumKey)
            : undefined;
        const recentCategories = sessionMomentumKey
            ? this.momentum.getRecentCategories(sessionMomentumKey)
            : undefined;
        const baseResolved = await (isHeartbeat
            ? this.resolveService.resolveForTier(agentId, tenantId, 'simple')
            : this.resolveService.resolveLazy(agentId, tenantId, async () => {
                const scoringBody = resolveChatBody ? await resolveChatBody() : body;
                const messages = (Array.isArray(scoringBody.messages) ? scoringBody.messages : []);
                return {
                    messages: this.filterScoringMessages(messages),
                    tools: Array.isArray(scoringBody.tools) ? scoringBody.tools : undefined,
                    tool_choice: scoringBody.tool_choice,
                    max_tokens: scoringBody.max_tokens,
                };
            }, recentTiers, specificityOverride, recentCategories, headers));
        return baseResolved;
    }
    async resolveExplicitModel(agentId, tenantId, requestedModel, headers) {
        if (headers) {
            const headerTier = await this.resolveService.resolveHeaderTier(agentId, tenantId, headers);
            if (headerTier)
                return headerTier;
        }
        const models = await this.modelDiscovery.getModelsForAgent(tenantId, agentId);
        const catalogRoute = (0, openai_model_id_1.routeForOpenAiModelId)(requestedModel, models);
        if (catalogRoute)
            return this.explicitRouting(agentId, tenantId, catalogRoute);
        if (!requestedModel.includes('/')) {
            const preferred = (0, route_helpers_1.subscriptionPreferredRoute)(requestedModel, models);
            if (preferred)
                return this.explicitRouting(agentId, tenantId, preferred);
        }
        const hasAmbiguousCatalogMatch = !requestedModel.includes('/') && models.some((model) => model.id === requestedModel);
        const route = hasAmbiguousCatalogMatch
            ? null
            : await this.resolveConnectedExplicitModel(agentId, tenantId, requestedModel);
        if (!route) {
            this.logger.warn(`Requested model "${requestedModel}" matches no connected provider route for ` +
                `agent=${agentId} — ` +
                `returning model-not-available`);
            return null;
        }
        return this.explicitRouting(agentId, tenantId, route);
    }
    async resolveConnectedExplicitModel(agentId, tenantId, requestedModel) {
        const candidate = (0, openai_model_id_1.explicitModelRouteCandidate)(requestedModel);
        if (!candidate)
            return null;
        if (candidate.providerQualified && candidate.model.endsWith(openai_model_id_1.SUBSCRIPTION_MODEL_SUFFIX)) {
            const subscriptionRoute = {
                provider: candidate.provider,
                authType: 'subscription',
                model: candidate.model.slice(0, -openai_model_id_1.SUBSCRIPTION_MODEL_SUFFIX.length),
            };
            return (await this.providerKeyService.hasRouteCredentials(tenantId, subscriptionRoute, agentId))
                ? subscriptionRoute
                : null;
        }
        const authTypes = ['api_key', 'local', 'subscription'];
        const routes = authTypes.map((authType) => ({
            provider: candidate.provider,
            authType,
            model: candidate.model,
        }));
        const connected = (await Promise.all(routes.map(async (route) => ({
            route,
            available: await this.providerKeyService.hasRouteCredentials(tenantId, route, agentId),
        })))).filter(({ available }) => available);
        if (candidate.providerQualified)
            return connected[0]?.route ?? null;
        return connected.length === 1 ? connected[0].route : null;
    }
    async explicitRouting(agentId, tenantId, route) {
        return {
            tier: 'default',
            route: await this.resolveService.pinRouteKeyLabel(agentId, tenantId, route),
            fallback_routes: null,
            response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
            confidence: 1,
            score: 0,
            reason: 'default',
            explicit_model_override: true,
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
    resolveCredentials(agentId, tenantId, resolved) {
        return (0, route_credentials_1.resolveRouteCredentials)(this.routeCredentialDeps(), {
            agentId,
            tenantId,
            provider: resolved.provider,
            authType: resolved.auth_type,
            providerKeyLabel: resolved.provider_key_label,
        });
    }
    effectiveFallbackRoutes(resolved) {
        let fallbackRoutes = resolved.fallback_routes ?? null;
        if ((resolved.response_mode ?? manifest_shared_1.DEFAULT_RESPONSE_MODE) === 'stream') {
            const effectiveRoutes = (0, response_mode_guard_1.effectiveRoutesForResponseMode)(resolved.response_mode, resolved.route, fallbackRoutes);
            fallbackRoutes = (effectiveRoutes.fallbackRoutes ?? []).filter((route) => !(0, manifest_shared_1.routeEquals)(route, resolved.route));
        }
        return fallbackRoutes ?? [];
    }
    async tryFallbackChain(args) {
        const { agentId, tenantId, resolved, primaryModel, forward, body, resolveChatBody, stream, sessionKey, sessionCacheKey, providerCacheKey, sessionMomentumKey, signal, apiMode, } = args;
        const fallbackRoutes = this.effectiveFallbackRoutes(resolved);
        if (fallbackRoutes.length === 0)
            return null;
        const fallbackModels = fallbackRoutes.map((r) => r.model);
        const primaryStatus = forward.response.status;
        const primaryErrorBody = await forward.response.text();
        await forward.attempt?.finishRecording?.((0, attempt_recording_capture_1.recordingResponseFromText)(primaryErrorBody));
        const primaryProvider = resolved.route?.provider;
        const primaryAuth = resolved.route?.authType;
        const { success, failures } = await this.fallbackService.tryFallbacks(agentId, tenantId, fallbackModels, body, stream, sessionKey, primaryModel, signal, primaryProvider, primaryAuth, args.signatureLookup, args.thinkingLookup, apiMode, resolveChatBody, fallbackRoutes, args.paramMergeContext, args.startProviderAttempt, args.credentialDashboardUrl, providerCacheKey, sessionCacheKey, args.clientAnthropicBeta);
        this.recordTierIfScoring(sessionMomentumKey, resolved.tier);
        this.recordCategoryIfValid(sessionMomentumKey, resolved.specificity_category);
        if (success) {
            const [fallbackModelParams, fallbackSpecs] = await Promise.all([
                success.authType
                    ? this.modelParamsService.get(args.paramMergeContext.agentId, args.paramMergeContext.scopeKey, success.provider, success.authType, success.model)
                    : null,
                success.authType
                    ? this.providerParamSpecs.getSpecs(success.provider, success.authType, success.model)
                    : [],
            ]);
            const fallbackRequestParams = (0, manifest_shared_1.snapshotRequestParams)({
                body: body,
                modelParams: fallbackModelParams,
                specs: fallbackSpecs,
            });
            return {
                forward: success.forward,
                meta: this.buildBaseMeta(resolved, success.model, {
                    provider: success.provider,
                    auth_type: success.authType,
                    provider_key_label: success.keyLabel,
                    primaryKeyLabel: args.primaryKeyLabel,
                    fallbackFromModel: primaryModel,
                    fallbackIndex: success.fallbackIndex,
                    primaryErrorStatus: primaryStatus,
                    primaryErrorBody,
                    primaryProvider,
                    primaryAuthType: primaryAuth,
                    primaryTenantProviderId: args.primaryTenantProviderId,
                    primaryAttempt: forward.attempt,
                    primaryProviderCallStarted: forward.providerCallStarted,
                    attempt: success.forward.attempt,
                    providerCallStarted: success.forward.providerCallStarted,
                    tenantProviderId: success.tenantProviderId,
                    request_params: fallbackRequestParams,
                }),
                failedFallbacks: failures,
                fallbackAutofix: success.autofix,
            };
        }
        const safeHeaders = new Headers(forward.response.headers);
        safeHeaders.delete('content-encoding');
        safeHeaders.delete('content-length');
        safeHeaders.delete('transfer-encoding');
        const rebuilt = new Response(primaryErrorBody, { status: primaryStatus, headers: safeHeaders });
        const [primaryModelParams, exhaustedSpecs] = await Promise.all([
            primaryProvider && primaryAuth && resolved.route
                ? this.modelParamsService.get(args.paramMergeContext.agentId, args.paramMergeContext.scopeKey, primaryProvider, primaryAuth, primaryModel)
                : null,
            primaryProvider && primaryAuth && resolved.route
                ? this.providerParamSpecs.getSpecs(primaryProvider, primaryAuth, primaryModel)
                : [],
        ]);
        const exhaustedRequestParams = (0, manifest_shared_1.snapshotRequestParams)({
            body: body,
            modelParams: primaryModelParams,
            specs: exhaustedSpecs,
        });
        return {
            forward: {
                response: rebuilt,
                isGoogle: forward.isGoogle,
                isAnthropic: forward.isAnthropic,
                isChatGpt: forward.isChatGpt,
                isResponses: forward.isResponses,
                isCodeAssist: forward.isCodeAssist,
            },
            meta: this.buildBaseMeta(resolved, primaryModel, {
                request_params: exhaustedRequestParams,
                tenantProviderId: args.primaryTenantProviderId,
                provider_key_label: args.primaryKeyLabel ?? resolved.route?.keyLabel ?? undefined,
                primaryAttempt: forward.attempt,
                primaryProviderCallStarted: forward.providerCallStarted,
                attempt: failures[failures.length - 1]?.attempt ?? forward.attempt,
                providerCallStarted: failures[failures.length - 1]?.providerCallStarted ?? forward.providerCallStarted,
            }),
            failedFallbacks: failures,
        };
    }
    buildBaseMeta(resolved, model, overrides = {}) {
        const directOverride = resolved.explicit_model_override === true;
        return {
            tier: directOverride ? 'direct' : resolved.tier,
            model,
            provider: overrides.provider ?? resolved.route?.provider ?? '',
            confidence: resolved.confidence,
            reason: directOverride ? 'direct' : resolved.reason,
            auth_type: resolved.route?.authType,
            specificity_category: resolved.specificity_category,
            provider_key_label: resolved.route?.keyLabel ?? undefined,
            header_tier_id: resolved.header_tier_id,
            header_tier_name: resolved.header_tier_name,
            header_tier_color: resolved.header_tier_color,
            output_modality: resolved.output_modality,
            response_mode: resolved.response_mode ?? manifest_shared_1.DEFAULT_RESPONSE_MODE,
            ...overrides,
        };
    }
    recordCategoryIfValid(sessionKey, category) {
        if (!sessionKey)
            return;
        if (!category)
            return;
        if (!manifest_shared_1.SPECIFICITY_CATEGORIES.includes(category))
            return;
        this.momentum.recordCategory(sessionKey, category);
    }
    async enforceLimits(tenantId, agentName) {
        if (!agentName)
            return null;
        const exceeded = await this.limitCheck.checkLimits(tenantId, agentName);
        if (!exceeded)
            return null;
        const fmt = exceeded.metricType === 'cost'
            ? `$${Number(exceeded.actual).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : Number(exceeded.actual).toLocaleString(undefined, { maximumFractionDigits: 0 });
        const threshFmt = exceeded.metricType === 'cost'
            ? `$${Number(exceeded.threshold).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : Number(exceeded.threshold).toLocaleString(undefined, { maximumFractionDigits: 0 });
        const dashboardUrl = (0, proxy_friendly_response_1.getDashboardUrl)(this.config, agentName, 'limits');
        return (0, error_codes_1.formatManifestError)('M200', {
            metric: exceeded.metricType,
            used: fmt,
            threshold: threshFmt,
            period: exceeded.period,
            dashboardUrl,
        });
    }
    filterScoringMessages(messages) {
        return messages
            .filter((m) => !SCORING_EXCLUDED_ROLES.has(m.role))
            .slice(-SCORING_RECENT_MESSAGES);
    }
    detectHeartbeatBody(body, apiMode) {
        if (apiMode !== 'responses') {
            const messages = (Array.isArray(body.messages) ? body.messages : []);
            return this.detectHeartbeat(this.filterScoringMessages(messages));
        }
        if (typeof body.input === 'string')
            return body.input.includes('HEARTBEAT_OK');
        if (!Array.isArray(body.input))
            return false;
        for (let i = body.input.length - 1; i >= 0; i--) {
            const item = body.input[i];
            if (typeof item === 'string')
                return item.includes('HEARTBEAT_OK');
            if (!item || typeof item !== 'object' || Array.isArray(item))
                continue;
            const record = item;
            if (record.type === 'function_call' || record.type === 'function_call_output')
                continue;
            const role = typeof record.role === 'string' ? record.role : 'user';
            if (role !== 'user')
                continue;
            if (typeof record.content === 'string') {
                return record.content.includes('HEARTBEAT_OK');
            }
            if (!Array.isArray(record.content))
                return false;
            return record.content.some((part) => !!part &&
                typeof part === 'object' &&
                !Array.isArray(part) &&
                typeof part.text === 'string' &&
                part.text.includes('HEARTBEAT_OK'));
        }
        return false;
    }
    detectHeartbeat(scoringMessages) {
        const lastUser = [...scoringMessages].reverse().find((m) => m.role === 'user');
        if (!lastUser)
            return false;
        if (typeof lastUser.content === 'string')
            return lastUser.content.includes('HEARTBEAT_OK');
        if (Array.isArray(lastUser.content)) {
            return lastUser.content.some((p) => p.type === 'text' && typeof p.text === 'string' && p.text.includes('HEARTBEAT_OK'));
        }
        return false;
    }
    buildNoProviderResult(stream, agentName) {
        const dashboardUrl = (0, proxy_friendly_response_1.getDashboardUrl)(this.config, agentName, 'routing');
        const content = (0, error_codes_1.formatManifestError)('M101', { dashboardUrl });
        return (0, proxy_friendly_response_1.buildFriendlyResponse)(content, stream, 'no_provider', 'M101');
    }
    buildModelUnavailableResult(stream, agentName, model) {
        const dashboardUrl = (0, proxy_friendly_response_1.getDashboardUrl)(this.config, agentName, 'routing');
        const content = (0, error_codes_1.formatManifestError)('M302', { model, dashboardUrl });
        return (0, proxy_friendly_response_1.buildFriendlyResponse)(content, stream, 'model_not_available', 'M302');
    }
    buildCacheLookups(sessionKey) {
        return {
            signatureLookup: (toolCallId) => this.signatureCache.retrieve(sessionKey, toolCallId),
            thinkingLookup: (firstToolUseId, routeContext) => routeContext
                ? this.thinkingCache.retrieve(sessionKey, firstToolUseId, routeContext)
                : this.thinkingCache.retrieve(sessionKey, firstToolUseId),
        };
    }
};
exports.ProxyService = ProxyService;
exports.ProxyService = ProxyService = ProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [resolve_service_1.ResolveService,
        model_discovery_service_1.ModelDiscoveryService,
        provider_key_service_1.ProviderKeyService,
        openai_oauth_service_1.OpenaiOauthService,
        minimax_oauth_service_1.MinimaxOauthService,
        anthropic_oauth_service_1.AnthropicOauthService,
        gemini_oauth_service_1.GeminiOauthService,
        kiro_oauth_service_1.KiroOauthService,
        xai_oauth_service_1.XaiOauthService,
        session_momentum_service_1.SessionMomentumService,
        limit_check_service_1.LimitCheckService,
        proxy_fallback_service_1.ProxyFallbackService,
        config_1.ConfigService,
        thought_signature_cache_1.ThoughtSignatureCache,
        thinking_block_cache_1.ThinkingBlockCache,
        agent_model_params_service_1.AgentModelParamsService,
        provider_param_spec_service_1.ProviderParamSpecService,
        autofix_service_1.AutofixService])
], ProxyService);
function sanitizeNullContent(messages) {
    for (const msg of messages) {
        if (msg && typeof msg === 'object' && msg.content === null)
            msg.content = '';
    }
}
//# sourceMappingURL=proxy.service.js.map