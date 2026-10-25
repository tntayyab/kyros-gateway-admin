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
var ProviderClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderClient = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const openai_models_1 = require("../../common/constants/openai-models");
const xai_models_1 = require("../../common/constants/xai-models");
const provider_endpoints_1 = require("./provider-endpoints");
const url_validation_1 = require("../../common/utils/url-validation");
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
const provider_hooks_1 = require("./provider-hooks");
const anthropic_beta_1 = require("./anthropic-beta");
const cache_injection_1 = require("./cache-injection");
const provider_client_converters_1 = require("./provider-client-converters");
const codex_session_affinity_1 = require("./codex-session-affinity");
const reasoning_model_catalog_1 = require("./reasoning-model-catalog");
const responses_adapter_1 = require("./responses-adapter");
const responses_tools_1 = require("./responses-tools");
const kiro_adapter_1 = require("./kiro-adapter");
const opencode_go_catalog_service_1 = require("../../model-discovery/opencode-go-catalog.service");
const provider_model_registry_service_1 = require("../../model-discovery/provider-model-registry.service");
const chatgpt_response_qualifier_1 = require("./chatgpt-response-qualifier");
const provider_availability_1 = require("../../common/utils/provider-availability");
const manifest_error_1 = require("../../common/errors/manifest-error");
const managed_free_providers_1 = require("../../common/constants/managed-free-providers");
const bedrock_region_1 = require("../bedrock-region");
const bedrock_runtime_capabilities_1 = require("../bedrock-runtime-capabilities");
function wireApiMode(endpoint) {
    if (endpoint.format === 'openai')
        return 'chat_completions';
    if (endpoint.format === 'anthropic')
        return 'messages';
    if (endpoint.format === 'chatgpt')
        return 'responses';
    return undefined;
}
function wireFormat(endpoint) {
    if (endpoint.format === 'openai')
        return 'openai_chat_completions';
    if (endpoint.format === 'anthropic')
        return 'anthropic_messages';
    if (endpoint.format === 'chatgpt')
        return 'openai_responses';
    if (endpoint.format === 'google') {
        return endpoint.codeAssistEnvelope ? 'google_code_assist' : 'google_generate_content';
    }
    return undefined;
}
const INPUT_WIRE_FORMATS = {
    chat_completions: 'openai_chat_completions',
    messages: 'anthropic_messages',
    responses: 'openai_responses',
};
function withClientAnthropicBeta(headers, clientAnthropicBeta) {
    const merged = (0, anthropic_beta_1.mergeAnthropicBeta)(headers['anthropic-beta'], clientAnthropicBeta);
    if (merged === undefined || merged === headers['anthropic-beta'])
        return headers;
    return { ...headers, 'anthropic-beta': merged };
}
const parsedProviderTimeout = Number.parseInt(process.env.PROVIDER_TIMEOUT_MS ?? '', 10);
const PROVIDER_TIMEOUT_MS = Number.isFinite(parsedProviderTimeout) && parsedProviderTimeout > 0
    ? parsedProviderTimeout
    : 180_000;
const QWEN_TOKEN_PLAN_RESPONSES_RE = /^qwen3\.7-max$/i;
const COPILOT_CHAT_COMPLETIONS_ENDPOINT = '/chat/completions';
const COPILOT_RESPONSES_ENDPOINTS = new Set(['/responses', 'ws:/responses']);
function shouldApplyAnthropicAutomaticCacheControl(endpointKey) {
    return endpointKey === 'anthropic';
}
function shouldAddConversationCacheBreakpoint(model, apiMode, inboundBody, requestBody) {
    if (!/claude/i.test(model))
        return false;
    if (apiMode === 'messages' && (0, provider_client_converters_1.hasMessageCacheControl)(inboundBody))
        return false;
    const { messages, tools } = requestBody;
    const hasTools = Array.isArray(tools) && tools.length > 0;
    return hasTools || (Array.isArray(messages) && messages.length > 1);
}
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function hasChatCompletionOutput(message) {
    return Object.entries(message).some(([key, value]) => {
        if (key === 'role' || value == null)
            return false;
        if (typeof value === 'string' || Array.isArray(value))
            return value.length > 0;
        return true;
    });
}
function isEmptyChatCompletion(body) {
    if (!isRecord(body) || !Array.isArray(body.choices))
        return false;
    return body.choices.every((choice) => isRecord(choice) &&
        choice.finish_reason === 'stop' &&
        isRecord(choice.message) &&
        !hasChatCompletionOutput(choice.message));
}
async function qualifyEmptyChatCompletion(response, attempt) {
    if (response.status !== common_1.HttpStatus.OK)
        return response;
    let body;
    try {
        body = await response.clone().json();
    }
    catch {
        return response;
    }
    if (!isEmptyChatCompletion(body))
        return response;
    await attempt?.finishRecording?.({ type: 'json', body });
    return new Response(JSON.stringify({
        error: {
            message: 'Upstream provider returned an empty Chat Completions response',
            type: 'server_error',
            code: 'empty_response',
        },
    }), { status: common_1.HttpStatus.BAD_GATEWAY, headers: { 'content-type': 'application/json' } });
}
function responsesTextFormat(body, apiMode) {
    if (apiMode !== 'responses' || !isRecord(body.text) || !isRecord(body.text.format)) {
        return undefined;
    }
    const format = body.text.format;
    if (format.type === 'json_object')
        return { type: 'json_object' };
    if (format.type !== 'json_schema')
        return undefined;
    const out = { type: 'json_schema' };
    if (format.name !== undefined)
        out.name = format.name;
    if (format.schema !== undefined)
        out.schema = format.schema;
    if (format.strict !== undefined)
        out.strict = format.strict;
    if (typeof format.description === 'string' && format.description) {
        out.description = format.description;
    }
    return out;
}
function buildPromptCacheKey(sessionKey) {
    const digest = (0, crypto_1.createHash)('sha256').update(sessionKey).digest('hex').slice(0, 32);
    return `manifest-${digest}`;
}
function applyHashedPromptCacheKey(body, providerCacheKey) {
    if (typeof body.prompt_cache_key === 'string' && body.prompt_cache_key)
        return;
    const trimmedCacheKey = providerCacheKey?.trim();
    if (!trimmedCacheKey)
        return;
    body.prompt_cache_key = buildPromptCacheKey(trimmedCacheKey);
}
function applyAnthropicUserIdForOpenAi(body, source = body) {
    const metadata = isRecord(source.metadata) ? source.metadata : undefined;
    delete body.metadata;
    const userId = metadata?.user_id;
    if (typeof userId !== 'string' || !userId)
        return;
    body.safety_identifier =
        userId.length <= 64 ? userId : (0, crypto_1.createHash)('sha256').update(userId).digest('hex');
}
function anthropicThinkingEffort(body, supportsReasoning) {
    if (!supportsReasoning)
        return undefined;
    return isRecord(body.thinking) && body.thinking.type === 'disabled' ? 'none' : undefined;
}
function applyAnthropicThinkingForOpenAi(body, supportsReasoning) {
    if (!('thinking' in body))
        return;
    const effort = anthropicThinkingEffort(body, supportsReasoning);
    delete body.thinking;
    if (effort !== undefined && body.reasoning_effort === undefined) {
        body.reasoning_effort = effort;
    }
}
function openRouterCacheMode(model) {
    const normalized = model.toLowerCase().replace(/^~/, '');
    if (normalized.startsWith('anthropic/'))
        return 'anthropic';
    if (normalized.startsWith('google/') || normalized.startsWith('qwen/'))
        return 'message';
    return null;
}
function stripModelPrefix(model, endpointKey) {
    if (endpointKey === 'openrouter' || managed_free_providers_1.MANAGED_FREE_PROVIDER_BY_ID.has(endpointKey))
        return model;
    if (endpointKey === 'commandcode' || endpointKey === 'commandcode-anthropic') {
        return model.startsWith('commandcode/') ? model.slice('commandcode/'.length) : model;
    }
    if (endpointKey === 'custom' ||
        endpointKey === 'fireworks' ||
        endpointKey === 'groq' ||
        endpointKey === 'huggingface' ||
        endpointKey === 'kilo' ||
        endpointKey === 'nous' ||
        endpointKey === 'nvidia' ||
        endpointKey === 'cline-pass' ||
        endpointKey === 'ollama' ||
        endpointKey === 'ollama-cloud' ||
        endpointKey === 'pioneer')
        return model;
    return (0, openai_models_1.stripVendorPrefix)(model);
}
let ProviderClient = ProviderClient_1 = class ProviderClient {
    opencodeGoCatalog;
    modelRegistry;
    reasoningCatalog;
    logger = new common_1.Logger(ProviderClient_1.name);
    codexAffinity;
    constructor(opencodeGoCatalog, modelRegistry, codexAffinity, reasoningCatalog) {
        this.opencodeGoCatalog = opencodeGoCatalog;
        this.modelRegistry = modelRegistry;
        this.reasoningCatalog = reasoningCatalog;
        this.codexAffinity = codexAffinity ?? new codex_session_affinity_1.CodexSessionAffinity();
    }
    modelSupportsReasoning(endpointKey, model) {
        return this.reasoningCatalog?.isReasoningModel(endpointKey, model) === true;
    }
    async forward(opts) {
        const { provider, apiKey, model, body, stream, signal, extraHeaders, customEndpoint, authType, } = opts;
        if (!customEndpoint && !(0, provider_availability_1.isProviderAvailableForDeployment)(provider)) {
            throw new manifest_error_1.ManifestError('M303', common_1.HttpStatus.BAD_REQUEST);
        }
        const { endpoint, endpointKey } = await this.resolveEndpoint(customEndpoint, provider, authType, model, opts.apiMode);
        const isGoogle = endpoint.format === 'google';
        const isAnthropic = endpoint.format === 'anthropic';
        const isResponses = opts.apiMode === 'responses' && endpoint.format === 'chatgpt';
        const isChatGpt = endpoint.format === 'chatgpt' && !isResponses;
        const isCodeAssist = !!endpoint.codeAssistEnvelope;
        const textFormat = responsesTextFormat(body, opts.apiMode);
        const resolvedWireApiMode = wireApiMode(endpoint);
        const resolvedWireFormat = wireFormat(endpoint);
        const needsChatBody = opts.apiMode !== undefined &&
            opts.apiMode !== 'chat_completions' &&
            INPUT_WIRE_FORMATS[opts.apiMode] !== resolvedWireFormat;
        const chatBody = needsChatBody ? await opts.resolveChatBody?.() : undefined;
        const bareModel = stripModelPrefix(model, endpointKey);
        if (endpoint.format === 'kiro') {
            const requestSource = chatBody ?? body;
            opts.attempt?.startRecording?.({
                requestBody: requestSource,
                wireFormat: 'kiro_chat',
            });
            const response = await (0, kiro_adapter_1.forwardKiroChat)({
                apiKey,
                model: bareModel,
                body: requestSource,
                stream,
                signal,
                timeoutMs: PROVIDER_TIMEOUT_MS,
                extraHeaders,
            });
            return {
                response,
                isGoogle: false,
                isAnthropic: false,
                isChatGpt: false,
                wireRequestBody: requestSource,
                wireFormat: 'kiro_chat',
                wireApiMode: opts.apiMode,
                responsesTextFormat: textFormat,
                responsesToolNames: opts.apiMode === 'responses' ? (0, responses_tools_1.responsesToolNames)(body.tools) : undefined,
            };
        }
        const { url, headers, requestBody } = this.buildRequest({
            endpoint,
            endpointKey,
            provider,
            bareModel,
            model,
            apiKey,
            authType,
            body,
            chatBody,
            apiMode: opts.apiMode,
            stream,
            signatureLookup: opts.signatureLookup,
            thinkingLookup: opts.thinkingLookup,
            thinkingRouteContext: opts.thinkingRouteContext,
            clientAnthropicBeta: opts.clientAnthropicBeta,
            providerResource: opts.providerResource,
            sessionKey: opts.sessionKey,
            providerCacheKey: opts.providerCacheKey,
        });
        const affinity = endpointKey === 'openai-subscription'
            ? this.codexAffinity.prepare(apiKey, requestBody)
            : undefined;
        const finalHeaders = affinity || extraHeaders ? { ...headers, ...extraHeaders, ...affinity?.headers } : headers;
        const retryWireBody = async (wireRequestBody, attempt = opts.attempt) => {
            if (resolvedWireFormat) {
                attempt?.startRecording?.({
                    requestBody: wireRequestBody,
                    wireFormat: resolvedWireFormat,
                });
            }
            this.logger.debug(`Forwarding to ${endpointKey}: ${url.replace(/key=[^&]+/, 'key=***')}`);
            if (endpoint.requiresSsrfRevalidation) {
                try {
                    await (0, url_validation_1.validatePublicUrl)(url, { allowPrivate: (0, detect_self_hosted_1.isSelfHosted)() });
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    throw new Error(`Refusing to forward to disallowed URL: ${message}`);
                }
            }
            const result = await this.executeFetch(url, finalHeaders, wireRequestBody, signal, stream, {
                isGoogle,
                isAnthropic,
                isChatGpt,
                isResponses,
                isCodeAssist,
                responsesTextFormat: textFormat,
                responsesToolNames: opts.apiMode === 'responses' ? (0, responses_tools_1.responsesToolNames)(body.tools) : undefined,
            });
            const response = !stream &&
                endpoint.format === 'openai' &&
                (opts.apiMode === undefined || opts.apiMode === 'chat_completions')
                ? await qualifyEmptyChatCompletion(result.response, attempt)
                : result.response;
            const qualifiedResult = endpointKey === 'openai-subscription'
                ? {
                    ...result,
                    response: await (0, chatgpt_response_qualifier_1.qualifyChatGptResponse)(response, {
                        downstreamFormat: isResponses ? 'responses' : 'chat-completions',
                    }),
                }
                : { ...result, response };
            if (affinity) {
                this.codexAffinity.capture(affinity.storeKey, qualifiedResult.response, affinity.incarnation);
            }
            return {
                ...qualifiedResult,
                wireRequestBody,
                wireRequestUrl: url,
                wireFormat: resolvedWireFormat,
                wireApiMode: resolvedWireApiMode,
                retryWireBody,
            };
        };
        return retryWireBody(requestBody);
    }
    async resolveEndpoint(customEndpoint, provider, authType, model, apiMode) {
        if (customEndpoint) {
            return { endpoint: customEndpoint, endpointKey: 'custom' };
        }
        let resolved = (0, provider_endpoints_1.resolveEndpointKey)(provider);
        if (!resolved) {
            throw new Error(`No endpoint configured for provider: ${provider}`);
        }
        if (authType === 'subscription') {
            const override = (0, provider_hooks_1.resolveSubscriptionEndpointKey)(resolved);
            if (override)
                resolved = override;
        }
        if (resolved === 'bedrock') {
            resolved = (0, provider_endpoints_1.resolveBedrockEndpointKey)(model, apiMode);
        }
        if (resolved === 'qwen-subscription') {
            const bareQwenModel = (0, openai_models_1.stripVendorPrefix)(model);
            if (apiMode === 'responses' || QWEN_TOKEN_PLAN_RESPONSES_RE.test(bareQwenModel)) {
                resolved = 'qwen-subscription-responses';
            }
        }
        if (apiMode === 'responses' && resolved === 'openai') {
            resolved = 'openai-responses';
        }
        if (apiMode === 'responses' && resolved === 'xai') {
            resolved = 'xai-responses';
        }
        if (resolved === 'openai' && openai_models_1.OPENAI_RESPONSES_ONLY_RE.test((0, openai_models_1.stripVendorPrefix)(model))) {
            resolved = 'openai-responses';
        }
        if (resolved === 'xai' && xai_models_1.XAI_RESPONSES_ONLY_RE.test((0, openai_models_1.stripVendorPrefix)(model))) {
            resolved = 'xai-responses';
        }
        if (resolved === 'copilot') {
            const metadataEndpoint = this.resolveCopilotEndpointFromMetadata(model, apiMode);
            if (metadataEndpoint) {
                resolved = metadataEndpoint;
            }
            else if (openai_models_1.OPENAI_RESPONSES_ONLY_RE.test((0, openai_models_1.stripVendorPrefix)(model))) {
                resolved = 'copilot-responses';
            }
        }
        if (resolved === 'opencode-go') {
            const bareOpenCodeModel = (0, openai_models_1.stripVendorPrefix)(model).toLowerCase();
            const catalogFormat = await this.resolveOpencodeGoFormat(bareOpenCodeModel);
            if (catalogFormat === 'responses') {
                resolved = 'opencode-go-responses';
            }
            else {
                const knownAnthropicFamily = this.isKnownOpencodeGoAnthropicFamily(bareOpenCodeModel);
                if (catalogFormat === 'anthropic' || (!catalogFormat && knownAnthropicFamily)) {
                    resolved = 'opencode-go-anthropic';
                }
            }
        }
        if (resolved === 'commandcode') {
            const bareCommandCodeModel = model.startsWith('commandcode/')
                ? model.slice('commandcode/'.length).toLowerCase()
                : model.toLowerCase();
            if (bareCommandCodeModel.startsWith('claude-')) {
                resolved = 'commandcode-anthropic';
            }
        }
        if (resolved === 'opencode-zen' &&
            (0, openai_models_1.stripVendorPrefix)(model).toLowerCase().startsWith('gemini-')) {
            resolved = 'opencode-zen-google';
        }
        return { endpoint: provider_endpoints_1.PROVIDER_ENDPOINTS[resolved], endpointKey: resolved };
    }
    async resolveOpencodeGoFormat(bareModel) {
        if (!this.opencodeGoCatalog)
            return null;
        try {
            return await this.opencodeGoCatalog.resolveFormat(bareModel);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`OpenCode Go catalog format lookup failed: ${message}`);
            return null;
        }
    }
    isKnownOpencodeGoAnthropicFamily(bareModel) {
        return bareModel.startsWith('minimax-') || bareModel.startsWith('qwen3.7');
    }
    resolveCopilotEndpointFromMetadata(model, apiMode) {
        const endpoints = this.getCopilotSupportedEndpoints(model);
        if (!endpoints)
            return null;
        const hasChat = endpoints.has(COPILOT_CHAT_COMPLETIONS_ENDPOINT);
        const hasResponses = Array.from(COPILOT_RESPONSES_ENDPOINTS).some((endpoint) => endpoints.has(endpoint));
        if (apiMode === 'responses') {
            if (hasResponses)
                return 'copilot-responses';
            if (hasChat)
                return 'copilot';
            return null;
        }
        if (hasChat)
            return 'copilot';
        if (hasResponses)
            return 'copilot-responses';
        return null;
    }
    getCopilotSupportedEndpoints(model) {
        const bareModel = (0, openai_models_1.stripVendorPrefix)(model);
        const candidates = Array.from(new Set([model, `copilot/${bareModel}`, bareModel]));
        for (const candidate of candidates) {
            const endpoints = this.modelRegistry?.getModelMetadata('copilot', candidate)?.supportedEndpoints;
            if (endpoints && endpoints.length > 0)
                return new Set(endpoints);
        }
        return null;
    }
    buildRequest(ctx) {
        const { endpoint, endpointKey, bareModel, apiKey, authType, body, chatBody, stream } = ctx;
        const requestSource = chatBody ?? body;
        if (endpoint.format === 'google') {
            const path = stream && endpoint.buildStreamPath
                ? endpoint.buildStreamPath(bareModel)
                : endpoint.buildPath(bareModel);
            let url = `${endpoint.baseUrl}${path}`;
            if (stream)
                url += '?alt=sse';
            const innerBody = (0, provider_client_converters_1.toGoogleRequest)(requestSource, bareModel, ctx.signatureLookup);
            const requestBody = endpoint.codeAssistEnvelope
                ?
                    { model: bareModel, project: ctx.providerResource ?? '', request: innerBody }
                : innerBody;
            return {
                url,
                headers: endpoint.buildHeaders(apiKey, authType),
                requestBody,
            };
        }
        if (endpoint.format === 'anthropic') {
            const injectSubscriptionIdentity = authType === 'subscription' && !endpoint.skipSubscriptionIdentity;
            const thinkingRouteContext = ctx.thinkingRouteContext ?? {
                provider: ctx.provider,
                authType,
                model: ctx.model,
            };
            const requestBody = ctx.apiMode === 'messages'
                ? (0, provider_client_converters_1.applyAnthropicMessagesMutations)(body, {
                    injectSubscriptionIdentity,
                    thinkingLookup: ctx.thinkingLookup,
                    thinkingRouteContext,
                })
                : (0, provider_client_converters_1.toAnthropicRequest)(requestSource, bareModel, {
                    injectSubscriptionIdentity,
                    thinkingLookup: ctx.thinkingLookup,
                    thinkingRouteContext,
                });
            requestBody.model = bareModel;
            if (stream)
                requestBody.stream = true;
            if (shouldApplyAnthropicAutomaticCacheControl(endpointKey)) {
                (0, provider_client_converters_1.applyAnthropicAutomaticCacheControl)(requestBody);
            }
            else if (shouldAddConversationCacheBreakpoint(bareModel, ctx.apiMode, body, requestBody)) {
                (0, provider_client_converters_1.applyAnthropicLastMessageCacheControl)(requestBody);
            }
            return {
                url: `${endpoint.baseUrl}${endpoint.buildPath(bareModel)}`,
                headers: withClientAnthropicBeta(endpoint.buildHeaders(apiKey, authType), ctx.apiMode === 'messages' && (0, anthropic_beta_1.isAnthropicHost)(endpoint.baseUrl)
                    ? ctx.clientAnthropicBeta
                    : undefined),
                requestBody,
            };
        }
        if (endpoint.format === 'chatgpt') {
            const requestBody = ctx.apiMode === 'responses'
                ?
                    (0, responses_adapter_1.toNativeResponsesRequest)(body, bareModel, {
                        defaultInstructions: endpointKey === 'openai-subscription',
                        inputList: endpointKey === 'openai-subscription',
                        forceStream: endpointKey === 'openai-subscription',
                        stripCodexUnsupported: endpointKey === 'openai-subscription',
                    })
                : (0, provider_client_converters_1.toResponsesRequest)(requestSource, bareModel, {
                    stream: endpointKey === 'openai-subscription'
                        ? true
                        : endpointKey === 'openai-responses' ||
                            endpointKey === 'xai-responses' ||
                            endpoint.forwardResponsesStream
                            ? ctx.stream
                            : undefined,
                    mapMaxOutputTokens: endpointKey === 'openai-responses' ||
                        endpointKey === 'copilot-responses' ||
                        endpointKey === 'xai-responses' ||
                        endpoint.acceptsMaxOutputTokens,
                    forwardPromptCacheKey: endpointKey === 'openai-subscription' ||
                        endpointKey === 'openai-responses' ||
                        endpointKey === 'xai-responses',
                    mapReasoningEffort: endpointKey === 'openai-subscription' || endpointKey === 'openai-responses',
                });
            if (endpointKey === 'xai-responses' || endpoint.acceptsPromptCacheKey) {
                applyHashedPromptCacheKey(requestBody, ctx.providerCacheKey);
            }
            if (endpointKey === 'openai-responses' && ctx.apiMode === 'messages') {
                applyAnthropicUserIdForOpenAi(requestBody, requestSource);
            }
            if ((endpointKey === 'openai-responses' || endpointKey === 'openai-subscription') &&
                ctx.apiMode === 'messages') {
                const effort = anthropicThinkingEffort(requestSource, this.modelSupportsReasoning('openai', ctx.model));
                if (effort !== undefined && requestBody.reasoning === undefined) {
                    requestBody.reasoning = { effort };
                }
            }
            if (endpointKey === 'openai-responses' || endpointKey === 'openai-subscription') {
                applyHashedPromptCacheKey(requestBody, ctx.providerCacheKey);
            }
            if (endpointKey === 'copilot-responses') {
                requestBody.stream = true;
            }
            return {
                url: `${endpoint.baseUrl}${endpoint.buildPath(bareModel)}`,
                headers: endpoint.buildHeaders(apiKey, authType),
                requestBody,
            };
        }
        const isBedrockRuntimeGpt = (0, bedrock_region_1.isBedrockProvider)(ctx.provider) &&
            (0, bedrock_runtime_capabilities_1.getBedrockRuntimeCapabilities)(ctx.model)?.chatTokenParameter === 'max_completion_tokens';
        const sanitized = (0, provider_client_converters_1.sanitizeOpenAiBody)(requestSource, endpointKey, ctx.model, {
            requireMaxCompletionTokens: isBedrockRuntimeGpt,
            forwardReasoningEffort: isBedrockRuntimeGpt,
        });
        if (stream && endpoint.streamUsageReporting === 'openai_stream_options') {
            const existing = typeof sanitized.stream_options === 'object' && sanitized.stream_options !== null
                ? sanitized.stream_options
                : {};
            sanitized.stream_options = { ...existing, include_usage: true };
        }
        const requestBody = { ...sanitized, model: bareModel, stream };
        if (endpointKey === 'openai') {
            if (ctx.apiMode === 'messages') {
                applyAnthropicUserIdForOpenAi(requestBody);
                applyAnthropicThinkingForOpenAi(requestBody, this.modelSupportsReasoning(endpointKey, ctx.model));
            }
            applyHashedPromptCacheKey(requestBody, ctx.providerCacheKey);
        }
        if (endpointKey === 'mistral') {
            applyHashedPromptCacheKey(requestBody, ctx.providerCacheKey);
        }
        if (endpoint.acceptsPromptCacheKey) {
            applyHashedPromptCacheKey(requestBody, ctx.providerCacheKey);
        }
        if (endpointKey === 'moonshot') {
            applyHashedPromptCacheKey(requestBody, ctx.providerCacheKey);
        }
        if (endpointKey === 'fireworks') {
            applyHashedPromptCacheKey(requestBody, ctx.providerCacheKey);
        }
        if (endpointKey === 'qwen' || endpointKey === 'qwen-subscription') {
            (0, cache_injection_1.injectOpenAiMessageCacheControl)(requestBody);
        }
        if (endpointKey === 'openrouter') {
            const cacheMode = openRouterCacheMode(ctx.model);
            if (cacheMode) {
                (0, cache_injection_1.injectOpenRouterCacheControl)(requestBody, cacheMode);
                if (cacheMode === 'anthropic') {
                    (0, provider_client_converters_1.applyAnthropicAutomaticCacheControl)(requestBody);
                }
            }
        }
        return {
            url: `${endpoint.baseUrl}${endpoint.buildPath(bareModel)}`,
            headers: endpoint.buildHeaders(apiKey, authType),
            requestBody,
        };
    }
    async executeFetch(url, headers, requestBody, signal, stream, formatFlags) {
        let fetchSignal;
        let timeout;
        let timeoutController;
        if (stream) {
            timeoutController = new AbortController();
            timeout = setTimeout(() => {
                const timeoutError = new Error('Upstream provider request timed out');
                timeoutError.name = 'TimeoutError';
                timeoutController?.abort(timeoutError);
            }, PROVIDER_TIMEOUT_MS);
            fetchSignal = signal
                ? AbortSignal.any([timeoutController.signal, signal])
                : timeoutController.signal;
        }
        else {
            const timeoutSignal = AbortSignal.timeout(PROVIDER_TIMEOUT_MS);
            fetchSignal = signal ? AbortSignal.any([timeoutSignal, signal]) : timeoutSignal;
        }
        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                signal: fetchSignal,
                redirect: 'error',
            });
        }
        catch (err) {
            const errorLike = err !== null && typeof err === 'object'
                ? err
                : undefined;
            const message = typeof errorLike?.message === 'string' ? errorLike.message : String(err);
            const sanitizedError = new Error(message.replace(/key=[^&\s]+/gi, 'key=***'));
            if (typeof errorLike?.name === 'string')
                sanitizedError.name = errorLike.name;
            throw sanitizedError;
        }
        finally {
            if (timeout)
                clearTimeout(timeout);
        }
        return { response, ...formatFlags };
    }
    convertChatGptResponse = provider_client_converters_1.convertChatGptResponse;
    createChatGptStreamTransformer = provider_client_converters_1.createChatGptStreamTransformer;
    convertGoogleResponse = provider_client_converters_1.convertGoogleResponse;
    convertGoogleStreamChunk = provider_client_converters_1.convertGoogleStreamChunk;
    convertAnthropicResponse = provider_client_converters_1.convertAnthropicResponse;
    convertAnthropicStreamChunk = provider_client_converters_1.convertAnthropicStreamChunk;
    createAnthropicStreamTransformer = provider_client_converters_1.createAnthropicTransformer;
    createReasoningContentStreamTransformer = provider_client_converters_1.createReasoningContentStreamTransformer;
    collectChatGptSseResponse = provider_client_converters_1.collectChatGptSseResponse;
};
exports.ProviderClient = ProviderClient;
exports.ProviderClient = ProviderClient = ProviderClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [opencode_go_catalog_service_1.OpencodeGoCatalogService,
        provider_model_registry_service_1.ProviderModelRegistryService,
        codex_session_affinity_1.CodexSessionAffinity,
        reasoning_model_catalog_1.ModelsDevReasoningCatalog])
], ProviderClient);
//# sourceMappingURL=provider-client.js.map