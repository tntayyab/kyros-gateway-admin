"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentPrimaryAttemptNumber = currentPrimaryAttemptNumber;
exports.nextResponsesSequenceNumber = nextResponsesSequenceNumber;
exports.buildMetaHeaders = buildMetaHeaders;
exports.buildOpenAiCompatibleError = buildOpenAiCompatibleError;
exports.handleProviderError = handleProviderError;
exports.recordFallbackFailures = recordFallbackFailures;
exports.handleStreamResponse = handleStreamResponse;
exports.handleNonStreamResponse = handleNonStreamResponse;
exports.recordSuccess = recordSuccess;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const autofix_types_1 = require("../autofix/autofix.types");
const stream_writer_1 = require("./stream-writer");
const sse_parser_1 = require("./sse-parser");
const proxy_error_sanitizer_1 = require("./proxy-error-sanitizer");
const secret_scrub_1 = require("../../common/utils/secret-scrub");
const responses_adapter_1 = require("./responses-adapter");
const anthropic_messages_adapter_1 = require("./anthropic-messages-adapter");
const google_adapter_1 = require("./google-adapter");
const anthropic_adapter_1 = require("./anthropic-adapter");
const reasoning_format_1 = require("./reasoning-format");
const codeassist_envelope_1 = require("../oauth/gemini/codeassist-envelope");
const logger = new common_1.Logger('ProxyResponseHandler');
function currentPrimaryAttemptNumber(autofix) {
    return (0, autofix_types_1.getAutofixRetry)(autofix) ? 2 : 1;
}
function createResponsesSequenceTracker() {
    const parser = (0, sse_parser_1.createSsePayloadParser)();
    let nextSequenceNumber = 0;
    const feed = (chunk) => {
        for (const event of parser.feed(chunk)) {
            const payload = event
                .split('\n')
                .filter((line) => !line.startsWith('event:') && !line.startsWith('id:'))
                .join('\n');
            try {
                const data = JSON.parse(payload);
                const sequenceNumber = data.sequence_number;
                if (typeof sequenceNumber === 'number' &&
                    Number.isInteger(sequenceNumber) &&
                    sequenceNumber >= 0) {
                    nextSequenceNumber = Math.max(nextSequenceNumber, sequenceNumber + 1);
                }
                else {
                    nextSequenceNumber += 1;
                }
            }
            catch {
                nextSequenceNumber += 1;
            }
        }
    };
    return { feed, next: () => nextSequenceNumber };
}
const responsesSequenceTrackers = new WeakMap();
function nextResponsesSequenceNumber(res) {
    return responsesSequenceTrackers.get(res)?.next() ?? 0;
}
function recordSafely(promise, label) {
    promise.catch((e) => logger.warn(`Failed to record ${label}: ${e}`));
}
function recordAutofixOriginalIfRetried(ctx, meta, recorder, autofix, traceId, callerAttribution, requestHeaders, requestId, route) {
    if (!autofix || !(0, autofix_types_1.getAutofixRetry)(autofix) || meta.autofixOriginalProviderCallStarted === false)
        return;
    recordSafely(recorder.recordAutofixOriginal(ctx, route?.model ?? meta.model, meta.tier, autofix, {
        requestId,
        attemptNumber: 1,
        attempt: meta.autofixOriginalAttempt,
        provider: route ? route.provider : meta.provider,
        reason: meta.reason,
        authType: route?.authType ?? meta.auth_type,
        traceId,
        callerAttribution,
        requestHeaders,
        requestParams: meta.request_params,
        specificityCategory: meta.specificity_category,
        providerKeyLabel: meta.primaryKeyLabel ?? meta.provider_key_label,
        tenantProviderId: route?.tenantProviderId === undefined ? meta.tenantProviderId : route.tenantProviderId,
        headerTierId: meta.header_tier_id,
        headerTierName: meta.header_tier_name,
        headerTierColor: meta.header_tier_color,
    }), 'autofix original');
}
function thinkingRouteContext(meta) {
    return {
        provider: meta.provider,
        authType: meta.auth_type,
        model: meta.model,
    };
}
function buildMetaHeaders(meta) {
    const headers = {
        'X-Manifest-Tier': meta.tier,
        'X-Manifest-Model': meta.model,
        'X-Manifest-Provider': meta.provider,
        'X-Manifest-Confidence': String(meta.confidence),
        'X-Manifest-Reason': meta.reason,
        'X-Manifest-Output-Modality': meta.output_modality ?? 'text',
        'X-Manifest-Response-Mode': meta.response_mode ?? 'buffered',
    };
    if (meta.specificity_category) {
        headers['X-Manifest-Specificity'] = meta.specificity_category;
    }
    if (meta.fallbackFromModel) {
        headers['X-Manifest-Fallback-From'] = meta.fallbackFromModel;
        headers['X-Manifest-Fallback-Index'] = String(meta.fallbackIndex ?? 0);
    }
    return headers;
}
function setHeaders(res, headers) {
    for (const [k, v] of Object.entries(headers))
        res.setHeader(k, v);
}
function buildOpenAiCompatibleError(status, errorBody, opts = {}) {
    const classified = (0, proxy_error_sanitizer_1.classifyProviderError)(status, errorBody);
    const structured = (0, proxy_error_sanitizer_1.parseStructuredProviderError)(status, errorBody);
    return {
        message: classified?.message ??
            structured?.message ??
            (0, proxy_error_sanitizer_1.sanitizeProviderError)(status, errorBody, process.env.NODE_ENV),
        type: classified?.type ??
            structured?.type ??
            (opts.apiMode === 'messages' && status >= 500
                ? status === 529
                    ? 'overloaded_error'
                    : 'api_error'
                : (0, proxy_error_sanitizer_1.openAiErrorTypeForStatus)(status)),
        param: structured?.param ?? null,
        code: opts.code !== undefined ? opts.code : (classified?.code ?? structured?.code ?? null),
        status,
        source: opts.source ?? classified?.source ?? 'provider',
        ...(opts.provider ? { provider: opts.provider } : {}),
        ...(opts.model ? { model: opts.model } : {}),
        ...(opts.extra ?? {}),
    };
}
async function handleProviderError(res, ctx, meta, metaHeaders, errorStatus, errorBody, failedFallbacks, recorder, traceId, callerAttribution, requestHeaders, autofix, requestId = (0, uuid_1.v4)(), requestDurationMs, apiMode) {
    recordAutofixOriginalIfRetried(ctx, meta, recorder, autofix, traceId, callerAttribution, requestHeaders, requestId);
    if (failedFallbacks && failedFallbacks.length > 0 && !meta.fallbackFromModel) {
        await handleFallbackExhausted(res, ctx, meta, metaHeaders, errorStatus, errorBody, failedFallbacks, recorder, traceId, callerAttribution, requestHeaders, autofix, requestId, requestDurationMs, apiMode);
        return;
    }
    recordSafely(recorder.recordProviderError(ctx, errorStatus, errorBody, {
        requestId,
        attemptNumber: currentPrimaryAttemptNumber(autofix),
        attempt: meta.attempt,
        skipAttempt: meta.providerCallStarted === false,
        requestDurationMs,
        model: meta.model,
        provider: meta.provider,
        tier: meta.tier,
        traceId,
        fallbackFromModel: meta.fallbackFromModel,
        fallbackIndex: meta.fallbackIndex,
        authType: meta.auth_type,
        reason: meta.reason,
        specificityCategory: meta.specificity_category,
        providerKeyLabel: meta.provider_key_label,
        tenantProviderId: meta.tenantProviderId,
        callerAttribution,
        requestHeaders,
        requestParams: meta.request_params,
        headerTierId: meta.header_tier_id,
        headerTierName: meta.header_tier_name,
        headerTierColor: meta.header_tier_color,
        autofix,
        apiMode,
    }), 'provider error');
    logger.warn(`Upstream error ${errorStatus}: provider=${meta.provider} model=${meta.model} tier=${meta.tier} body=${(0, secret_scrub_1.scrubSecrets)(errorBody).slice(0, 500)}`);
    res.status(errorStatus);
    setHeaders(res, metaHeaders);
    const responseBody = {
        ...(apiMode === 'messages' ? { type: 'error' } : {}),
        error: buildOpenAiCompatibleError(errorStatus, errorBody, {
            source: 'provider',
            provider: meta.provider,
            model: meta.model,
            apiMode,
        }),
    };
    res.json(responseBody);
}
function handleFallbackExhausted(res, ctx, meta, metaHeaders, errorStatus, errorBody, failedFallbacks, recorder, traceId, callerAttribution, requestHeaders, autofix, requestId, requestDurationMs, apiMode) {
    const baseTime = Date.now();
    const primaryAttemptNumber = currentPrimaryAttemptNumber(autofix);
    recordSafely(recorder.recordFailedFallbacks(ctx, meta.tier, meta.model, failedFallbacks, {
        requestId,
        firstAttemptNumber: primaryAttemptNumber + 1,
        traceId,
        baseTimeMs: baseTime,
        markHandled: true,
        lastAsError: true,
        authType: meta.auth_type,
        providerKeyLabel: meta.provider_key_label,
        reason: meta.reason,
        callerAttribution,
        requestHeaders,
        requestParams: meta.request_params,
        headerTierId: meta.header_tier_id,
        headerTierName: meta.header_tier_name,
        headerTierColor: meta.header_tier_color,
    }), 'fallback errors');
    const primaryTs = new Date(baseTime + (failedFallbacks.length + 1) * 100).toISOString();
    recordSafely(recorder.recordPrimaryFailure(ctx, meta.tier, meta.model, errorBody, primaryTs, meta.auth_type, {
        requestId,
        attemptNumber: primaryAttemptNumber,
        attempt: meta.primaryAttempt,
        skipAttempt: meta.primaryProviderCallStarted === false,
        requestDurationMs,
        provider: meta.provider,
        reason: meta.reason,
        tenantProviderId: meta.tenantProviderId,
        providerKeyLabel: meta.provider_key_label,
        callerAttribution,
        requestHeaders,
        requestParams: meta.request_params,
        headerTierId: meta.header_tier_id,
        headerTierName: meta.header_tier_name,
        headerTierColor: meta.header_tier_color,
        httpStatus: errorStatus,
        terminalHttpStatus: errorStatus,
        autofix,
        apiMode,
    }), 'primary failure');
    logger.warn(`Fallback chain exhausted: ${(0, secret_scrub_1.scrubSecrets)(errorBody).slice(0, 200)}`);
    res.status(errorStatus);
    setHeaders(res, metaHeaders);
    res.setHeader('X-Manifest-Fallback-Exhausted', 'true');
    const attempted = attemptedFallbackEntries(failedFallbacks, apiMode);
    const primaryAutofix = autofixSummary(autofix);
    const primary = buildOpenAiCompatibleError(errorStatus, errorBody, {
        source: 'provider',
        provider: meta.provider,
        model: meta.model,
        apiMode,
        extra: {
            auth_type: meta.auth_type ?? null,
            fallback_exhausted: true,
            primary_model: meta.model,
            primary_provider: meta.provider,
            ...(primaryAutofix ? { autofix: primaryAutofix } : {}),
            attempted_fallbacks: attempted,
        },
    });
    const responseBody = {
        ...(apiMode === 'messages' ? { type: 'error' } : {}),
        error: {
            ...primary,
            message: exhaustedMessage(primary.message, [
                { provider: meta.provider, model: meta.model, status: errorStatus },
                ...attempted,
            ]),
        },
    };
    res.json(responseBody);
}
function autofixSummary(record) {
    if (!record)
        return undefined;
    const retry = (0, autofix_types_1.getAutofixRetry)(record);
    return {
        applied: retry !== undefined,
        original_status: record.original_http_status,
        retry_status: retry?.http_status ?? null,
    };
}
function attemptedFallbackEntries(failedFallbacks, apiMode) {
    const retriedHops = new Set(failedFallbacks.filter((f) => f.autofixRole === 'retry').map((f) => f.fallbackIndex));
    return failedFallbacks
        .filter((f) => !(f.autofixRole === 'original' && retriedHops.has(f.fallbackIndex)))
        .map((f) => {
        const hop = buildOpenAiCompatibleError(f.status, f.errorBody, { apiMode });
        const hopAutofix = autofixSummary(f.autofix);
        return {
            model: f.model,
            provider: f.provider,
            auth_type: f.authType ?? null,
            status: f.status,
            code: hop.code ?? null,
            message: hop.message,
            ...(hopAutofix ? { autofix: hopAutofix } : {}),
        };
    });
}
function exhaustedMessage(primaryMessage, attempts) {
    const lead = /[.!?]$/.test(primaryMessage) ? primaryMessage : `${primaryMessage}.`;
    const list = attempts.map((a) => `${a.provider}/${a.model} ${a.status}`).join(', ');
    return `${lead} Every attempt failed: ${list}.`;
}
function recordFallbackFailures(ctx, meta, failedFallbacks, recorder, callerAttribution, requestHeaders, autofix, requestId = (0, uuid_1.v4)()) {
    if (!meta.fallbackFromModel)
        return undefined;
    const fallbackBaseTime = Date.now();
    const failures = failedFallbacks ?? [];
    const primaryAttemptNumber = currentPrimaryAttemptNumber(autofix);
    const primaryAuthType = meta.primaryAuthType ?? meta.auth_type;
    recordAutofixOriginalIfRetried(ctx, meta, recorder, autofix, undefined, callerAttribution, requestHeaders, requestId, {
        model: meta.fallbackFromModel,
        provider: meta.primaryProvider,
        authType: primaryAuthType,
        tenantProviderId: meta.primaryTenantProviderId,
    });
    recordSafely(recorder.recordPrimaryFailure(ctx, meta.tier, meta.fallbackFromModel, meta.primaryErrorBody ?? `Provider returned HTTP ${meta.primaryErrorStatus ?? 500}`, new Date(fallbackBaseTime).toISOString(), primaryAuthType, {
        requestId,
        attemptNumber: primaryAttemptNumber,
        attempt: meta.primaryAttempt,
        skipAttempt: meta.primaryProviderCallStarted === false,
        provider: meta.primaryProvider,
        reason: meta.reason,
        tenantProviderId: meta.primaryTenantProviderId === undefined
            ? meta.tenantProviderId
            : meta.primaryTenantProviderId,
        providerKeyLabel: meta.primaryKeyLabel ?? meta.provider_key_label,
        callerAttribution,
        requestHeaders,
        requestParams: meta.request_params,
        headerTierId: meta.header_tier_id,
        headerTierName: meta.header_tier_name,
        headerTierColor: meta.header_tier_color,
        httpStatus: meta.primaryErrorStatus,
        autofix,
    }), 'primary failure');
    if (failures.length > 0) {
        recordSafely(recorder.recordFailedFallbacks(ctx, meta.tier, meta.fallbackFromModel, failures, {
            requestId,
            firstAttemptNumber: primaryAttemptNumber + 1,
            baseTimeMs: fallbackBaseTime,
            markHandled: true,
            authType: primaryAuthType,
            providerKeyLabel: meta.primaryKeyLabel ?? meta.provider_key_label,
            reason: meta.reason,
            callerAttribution,
            requestHeaders,
            requestParams: meta.request_params,
            headerTierId: meta.header_tier_id,
            headerTierName: meta.header_tier_name,
            headerTierColor: meta.header_tier_color,
        }), 'fallback errors');
    }
    return new Date(fallbackBaseTime + (failures.length + 1) * 100).toISOString();
}
async function handleStreamResponse(res, forward, meta, metaHeaders, providerClient, signatureCache, sessionKey, thinkingCache, apiMode = 'chat_completions', reasoningCache, capture) {
    (0, stream_writer_1.initSseHeaders)(res, metaHeaders, 200);
    const responsesSequenceTracker = apiMode === 'responses' ? createResponsesSequenceTracker() : null;
    if (responsesSequenceTracker)
        responsesSequenceTrackers.set(res, responsesSequenceTracker);
    const onClient = responsesSequenceTracker
        ? (chunk) => responsesSequenceTracker.feed(chunk)
        : undefined;
    const relayOptions = {
        protocol: forward.wireFormat ??
            (forward.isGoogle
                ? forward.isCodeAssist
                    ? 'google_code_assist'
                    : 'google_generate_content'
                : forward.isAnthropic
                    ? 'anthropic_messages'
                    : forward.isChatGpt || forward.isResponses
                        ? 'openai_responses'
                        : 'openai_chat_completions'),
        ...(capture ? { onUpstreamChunk: (chunk) => capture.appendRaw(chunk) } : {}),
    };
    const messagesTransformer = apiMode === 'messages' ? (0, anthropic_messages_adapter_1.createMessagesStreamTransformer)(meta.model) : null;
    const responsesTransformer = apiMode === 'responses'
        ? (0, responses_adapter_1.createResponsesStreamTransformer)(meta.model, {
            textFormat: forward.responsesTextFormat,
            toolNames: forward.responsesToolNames,
        })
        : null;
    const streamTransformer = messagesTransformer ?? responsesTransformer;
    const finalize = streamTransformer ? () => streamTransformer.finalize() : undefined;
    const toClientChunk = streamTransformer
        ? (chunk) => streamTransformer.transform(chunk)
        : (chunk) => chunk;
    if (apiMode === 'responses' && forward.isResponses) {
        return (0, stream_writer_1.pipeStream)(forward.response.body, res, undefined, undefined, onClient, relayOptions);
    }
    if (forward.isGoogle) {
        const googleState = (0, google_adapter_1.createGoogleStreamState)();
        return (0, stream_writer_1.pipeStream)(forward.response.body, res, (chunk) => {
            const innerChunk = forward.isCodeAssist ? (0, codeassist_envelope_1.unwrapCodeAssistStreamPayload)(chunk) : chunk;
            const { chunk: out, signatures } = providerClient.convertGoogleStreamChunk(innerChunk, meta.model, googleState);
            if (signatureCache && sessionKey) {
                for (const s of signatures) {
                    signatureCache.store(sessionKey, s.toolCallId, s.signature);
                }
            }
            return out ? toClientChunk(out) : null;
        }, () => {
            const tail = (0, google_adapter_1.finishGoogleStream)(googleState, meta.model);
            const tailOut = tail ? toClientChunk(tail) : null;
            const end = finalize ? finalize() : 'data: [DONE]\n\n';
            return (tailOut ?? '') + (end ?? '') || null;
        }, onClient, relayOptions);
    }
    if (forward.isAnthropic) {
        const onThinkingBlocks = thinkingCache && sessionKey
            ? (firstToolUseId, blocks) => {
                thinkingCache.store(sessionKey, firstToolUseId, blocks, thinkingRouteContext(meta));
            }
            : undefined;
        const anthropicTransformer = providerClient.createAnthropicStreamTransformer(meta.model, onThinkingBlocks);
        if (apiMode === 'messages') {
            return (0, stream_writer_1.pipePassthrough)(forward.response.body, res, anthropicTransformer, onClient, relayOptions);
        }
        return (0, stream_writer_1.pipeStream)(forward.response.body, res, (chunk) => {
            const out = anthropicTransformer(chunk);
            return out ? toClientChunk(out) : null;
        }, finalize, onClient, relayOptions);
    }
    if (forward.isChatGpt || forward.isResponses) {
        const chatGptTransformer = providerClient.createChatGptStreamTransformer(meta.model);
        return (0, stream_writer_1.pipeStream)(forward.response.body, res, (chunk) => {
            const out = chatGptTransformer(chunk);
            if (!messagesTransformer)
                return out;
            return out ? toClientChunk(out) : null;
        }, finalize, onClient, relayOptions);
    }
    const reasoningStreamFormat = (0, reasoning_format_1.getOpenAiReasoningStreamFormat)(meta.provider, meta.model, reasoningCache?.modelCatalog);
    if (reasoningStreamFormat) {
        const onReasoningContent = reasoningCache && sessionKey
            ? (firstToolCallId, content) => {
                reasoningCache.store(sessionKey, firstToolCallId, content);
            }
            : undefined;
        const transformer = providerClient.createReasoningContentStreamTransformer(onReasoningContent, reasoningStreamFormat);
        return (0, stream_writer_1.pipeStream)(forward.response.body, res, (chunk) => {
            const out = transformer(chunk);
            return out ? toClientChunk(out) : null;
        }, finalize, onClient, relayOptions);
    }
    if (apiMode === 'responses' || apiMode === 'messages') {
        return (0, stream_writer_1.pipeStream)(forward.response.body, res, toClientChunk, finalize, onClient, relayOptions);
    }
    return (0, stream_writer_1.pipeStream)(forward.response.body, res, undefined, undefined, onClient, relayOptions);
}
function cacheReasoningContent(responseBody, cache, sessionKey) {
    if (!cache || !sessionKey)
        return;
    const body = responseBody;
    const choices = body?.choices;
    if (!Array.isArray(choices) || choices.length === 0)
        return;
    const firstChoice = choices[0];
    if (!firstChoice || typeof firstChoice !== 'object' || Array.isArray(firstChoice))
        return;
    const message = firstChoice.message;
    if (!message)
        return;
    const reasoningContent = message.reasoning_content;
    if (typeof reasoningContent !== 'string' || !reasoningContent)
        return;
    const toolCalls = message.tool_calls;
    if (Array.isArray(toolCalls) && toolCalls.length > 0) {
        const firstToolCall = toolCalls[0];
        const firstToolCallId = firstToolCall && typeof firstToolCall === 'object' && !Array.isArray(firstToolCall)
            ? firstToolCall.id
            : undefined;
        if (typeof firstToolCallId === 'string' && firstToolCallId) {
            cache.store(sessionKey, firstToolCallId, reasoningContent);
            return;
        }
    }
}
async function handleNonStreamResponse(res, forward, meta, metaHeaders, providerClient, signatureCache, sessionKey, thinkingCache, apiMode = 'chat_completions', reasoningCache, capture) {
    let responseBody;
    const recordedResponse = capture ? forward.response.clone() : null;
    if (apiMode === 'responses' && forward.isResponses) {
        responseBody = await readNativeResponsesBody(forward.response);
    }
    else if (forward.isGoogle) {
        const rawData = (await forward.response.json());
        const googleData = forward.isCodeAssist ? (0, codeassist_envelope_1.unwrapCodeAssistResponse)(rawData) : rawData;
        responseBody = providerClient.convertGoogleResponse(googleData, meta.model);
        const sigs = responseBody?._extractedSignatures;
        if (sigs && signatureCache && sessionKey) {
            for (const s of sigs)
                signatureCache.store(sessionKey, s.toolCallId, s.signature);
        }
        delete responseBody._extractedSignatures;
    }
    else if (apiMode === 'messages' && forward.isAnthropic) {
        const anthropicData = (await forward.response.json());
        const extracted = (0, anthropic_adapter_1.extractThinkingBlocksFromMessagesResponse)(anthropicData);
        if (extracted && thinkingCache && sessionKey) {
            thinkingCache.store(sessionKey, extracted.firstToolUseId, extracted.blocks, thinkingRouteContext(meta));
        }
        responseBody = anthropicData;
    }
    else if (forward.isAnthropic) {
        const anthropicData = (await forward.response.json());
        responseBody = providerClient.convertAnthropicResponse(anthropicData, meta.model);
        const extracted = responseBody?._extractedThinkingBlocks;
        if (extracted && thinkingCache && sessionKey) {
            thinkingCache.store(sessionKey, extracted.firstToolUseId, extracted.blocks, thinkingRouteContext(meta));
        }
        delete responseBody._extractedThinkingBlocks;
    }
    else if (forward.isChatGpt || forward.isResponses) {
        const contentType = forward.response.headers.get('content-type') ?? '';
        const text = await forward.response.text();
        const trimmed = text.trimStart();
        if (contentType.includes('text/event-stream') ||
            trimmed.startsWith('event:') ||
            trimmed.startsWith('data:')) {
            responseBody = providerClient.collectChatGptSseResponse(text, meta.model);
        }
        else {
            responseBody = providerClient.convertChatGptResponse(JSON.parse(text), meta.model);
        }
    }
    else {
        responseBody = await forward.response.json();
        if ((0, reasoning_format_1.supportsReasoningContent)(meta.provider, meta.model, reasoningCache?.modelCatalog)) {
            cacheReasoningContent(responseBody, reasoningCache, sessionKey);
        }
    }
    if (apiMode === 'responses' && !forward.isResponses) {
        responseBody = (0, responses_adapter_1.fromChatCompletionResponse)(responseBody, meta.model, {
            textFormat: forward.responsesTextFormat,
            toolNames: forward.responsesToolNames,
        });
    }
    else if (apiMode === 'messages' && !forward.isAnthropic) {
        responseBody = (0, anthropic_messages_adapter_1.chatCompletionsResponseToMessages)(responseBody, meta.model);
    }
    const body = responseBody;
    const streamUsage = (0, stream_writer_1.parseUsageObject)(body?.usage);
    if (recordedResponse && capture) {
        const raw = await recordedResponse.text();
        const contentType = recordedResponse.headers.get('content-type') ?? '';
        const trimmed = raw.trimStart();
        if (contentType.includes('text/event-stream') ||
            trimmed.startsWith('event:') ||
            trimmed.startsWith('data:')) {
            capture.setRaw(raw);
        }
        else {
            try {
                capture.setJson(JSON.parse(raw));
            }
            catch {
                capture.setJson(raw);
            }
        }
    }
    res.status(200);
    setHeaders(res, metaHeaders);
    res.json(responseBody);
    return streamUsage;
}
async function readNativeResponsesBody(response) {
    const contentType = response.headers.get('content-type') ?? '';
    const text = await response.text();
    const trimmed = text.trimStart();
    if (contentType.includes('text/event-stream') ||
        trimmed.startsWith('event:') ||
        trimmed.startsWith('data:')) {
        return (0, responses_adapter_1.collectResponsesSseResponse)(text);
    }
    return JSON.parse(text);
}
function recordSuccess(ctx, meta, streamUsage, fallbackSuccessTs, recorder, traceId, sessionKey, startTime, callerAttribution, requestHeaders, autofix, requestId = (0, uuid_1.v4)(), attemptNumber = currentPrimaryAttemptNumber(autofix), apiMode, fallbackAutofix) {
    if (meta.fallbackFromModel && fallbackSuccessTs) {
        const requestDurationMs = startTime == null ? undefined : Date.now() - startTime;
        recordSafely(recorder.recordFallbackSuccess(ctx, meta.model, meta.tier, {
            requestId,
            attemptNumber,
            attempt: meta.attempt,
            requestDurationMs,
            traceId,
            provider: meta.provider,
            fallbackFromModel: meta.fallbackFromModel,
            fallbackIndex: meta.fallbackIndex ?? 0,
            timestamp: fallbackSuccessTs,
            authType: meta.auth_type,
            reason: meta.reason,
            providerKeyLabel: meta.provider_key_label,
            tenantProviderId: meta.tenantProviderId,
            usage: streamUsage ?? undefined,
            callerAttribution,
            requestHeaders,
            requestParams: meta.request_params,
            headerTierId: meta.header_tier_id,
            headerTierName: meta.header_tier_name,
            headerTierColor: meta.header_tier_color,
            autofix,
            fallbackAutofix,
            apiMode,
        }), 'fallback success');
    }
    else {
        const usage = streamUsage ?? { prompt_tokens: 0, completion_tokens: 0 };
        const durationMs = startTime ? Date.now() - startTime : undefined;
        recordSafely(recorder.recordSuccessMessage(ctx, meta.model, meta.tier, meta.reason, usage, {
            requestId,
            attemptNumber,
            attempt: meta.attempt,
            traceId,
            provider: meta.provider,
            authType: meta.auth_type,
            sessionKey,
            durationMs,
            specificityCategory: meta.specificity_category,
            providerKeyLabel: meta.provider_key_label,
            tenantProviderId: meta.tenantProviderId,
            callerAttribution,
            requestHeaders,
            requestParams: meta.request_params,
            headerTierId: meta.header_tier_id,
            headerTierName: meta.header_tier_name,
            headerTierColor: meta.header_tier_color,
            autofix,
            apiMode,
        }), 'success message');
    }
    if (!meta.fallbackFromModel) {
        recordAutofixOriginalIfRetried(ctx, meta, recorder, autofix, traceId, callerAttribution, requestHeaders, requestId);
    }
}
//# sourceMappingURL=proxy-response-handler.js.map