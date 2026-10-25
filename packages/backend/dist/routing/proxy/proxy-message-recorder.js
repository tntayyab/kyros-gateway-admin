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
var ProxyMessageRecorder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyMessageRecorder = exports.FAILED_WITHOUT_MESSAGE = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const manifest_shared_1 = require("manifest-shared");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const request_entity_1 = require("../../entities/request.entity");
const model_pricing_cache_service_1 = require("../../model-prices/model-pricing-cache.service");
const ingest_event_bus_service_1 = require("../../common/services/ingest-event-bus.service");
const cost_calculator_1 = require("../../common/utils/cost-calculator");
const secret_scrub_1 = require("../../common/utils/secret-scrub");
const custom_provider_service_1 = require("../custom-provider/custom-provider.service");
const opencode_go_catalog_service_1 = require("../../model-discovery/opencode-go-catalog.service");
const providers_1 = require("../../common/constants/providers");
const provider_availability_1 = require("../../common/utils/provider-availability");
const provider_service_1 = require("../routing-core/provider.service");
const error_codes_1 = require("../../common/errors/error-codes");
const manifest_error_1 = require("../../common/errors/manifest-error");
const autofix_types_1 = require("../autofix/autofix.types");
const provider_error_normalizer_1 = require("../autofix/provider-error-normalizer");
const proxy_error_sanitizer_1 = require("./proxy-error-sanitizer");
exports.FAILED_WITHOUT_MESSAGE = 'Request failed without an error message.';
function buildAutofixDecision(entry) {
    if (!entry)
        return null;
    const present = entry.phoenix_status != null ||
        entry.issue_id != null ||
        entry.patch_id != null ||
        entry.heal_attempt_id != null ||
        entry.explanation != null;
    if (!present)
        return null;
    return {
        status: entry.phoenix_status ?? null,
        issueId: entry.issue_id ?? null,
        patchId: entry.patch_id ?? null,
        healAttemptId: entry.heal_attempt_id ?? null,
        explanation: entry.explanation ?? null,
    };
}
function autofixColumns(autofix, role) {
    if (!autofix)
        return {};
    const healEntry = autofix.chain.find((e) => e.operations != null ||
        e.issue_id != null ||
        e.heal_attempt_id != null ||
        e.explanation != null);
    const decision = buildAutofixDecision(healEntry);
    if (!(0, autofix_types_1.getAutofixRetry)(autofix)) {
        return decision ? { autofix_decision: decision } : {};
    }
    return {
        autofix_applied: true,
        autofix_group_id: autofix.groupId,
        autofix_role: role,
        autofix_operations: healEntry?.operations ?? null,
        autofix_decision: buildAutofixDecision(healEntry),
    };
}
function terminalAutofixRole(autofix) {
    return (0, autofix_types_1.getAutofixRetry)(autofix) ? 'retry' : 'original';
}
function buildMessageRow(ctx, overrides) {
    const row = {
        id: (0, uuid_1.v4)(),
        tenant_id: ctx.tenantId,
        agent_id: ctx.agentId,
        agent_name: ctx.agentName,
        user_id: ctx.userId,
        trace_id: null,
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_creation_tokens: 0,
        ...overrides,
    };
    const classified = classifyRow(row);
    const status = (0, manifest_shared_1.normalizeStatus)(row.status);
    const errorMessage = status === manifest_shared_1.FAILED_STATUS &&
        (typeof row.error_message !== 'string' || row.error_message.trim().length === 0)
        ? exports.FAILED_WITHOUT_MESSAGE
        : row.error_message;
    return { ...row, ...classified, status, error_message: errorMessage };
}
function normalizeSessionKey(sessionKey) {
    if (!sessionKey || sessionKey === 'default')
        return null;
    return sessionKey;
}
function attemptIdentity(attempt, attemptNumber) {
    return attempt
        ? {
            id: attempt.id,
            attempt_number: attempt.attemptNumber,
            timestamp: attempt.startedAt,
        }
        : { attempt_number: attemptNumber ?? null };
}
function buildRequestRow(ctx, requestId, attempt, terminal, autofix, apiMode) {
    const classified = classifyRow(attempt);
    const status = terminal ? (0, manifest_shared_1.normalizeStatus)(attempt.status) : manifest_shared_1.PENDING_STATUS;
    const errorMessage = terminal && status === manifest_shared_1.FAILED_STATUS
        ? typeof attempt.error_message === 'string' && attempt.error_message.trim().length > 0
            ? attempt.error_message
            : exports.FAILED_WITHOUT_MESSAGE
        : null;
    const timestamp = attempt.timestamp ?? new Date().toISOString();
    return {
        id: requestId,
        tenant_id: ctx.tenantId,
        agent_id: ctx.agentId,
        user_id: ctx.userId,
        agent_name: ctx.agentName,
        trace_id: attempt.trace_id ?? null,
        session_key: attempt.session_key ?? null,
        session_id: attempt.session_id ?? null,
        timestamp,
        duration_ms: attempt.duration_ms ?? null,
        status,
        autofix_status: (0, manifest_shared_1.deriveAutofixStatus)(autofix),
        error_message: errorMessage,
        error_http_status: terminal ? (attempt.error_http_status ?? null) : null,
        error_code: terminal ? (attempt.error_code ?? null) : null,
        error_origin: terminal ? classified.error_origin : null,
        error_class: terminal ? classified.error_class : null,
        requested_model: attempt.fallback_from_model ?? attempt.model ?? null,
        api_mode: apiMode ?? null,
        caller_attribution: attempt.caller_attribution ?? null,
        request_headers: attempt.request_headers ?? null,
        request_params: attempt.request_params ?? null,
        feedback_rating: attempt.feedback_rating ?? null,
        feedback_tags: attempt.feedback_tags ?? null,
        feedback_details: attempt.feedback_details ?? null,
    };
}
function classifyRow(row) {
    if ((0, manifest_shared_1.normalizeStatus)(row.status) === manifest_shared_1.PENDING_STATUS) {
        return { error_origin: null, error_class: null, superseded: false };
    }
    const code = row.error_code;
    const codeReason = code && (0, manifest_error_1.isRecordableManifestCode)(code) ? manifest_error_1.MANIFEST_CODE_TO_REASON[code] : undefined;
    return (0, manifest_shared_1.classifyMessageError)({
        status: row.status ?? 'ok',
        errorHttpStatus: row.error_http_status,
        routingReason: codeReason ?? row.routing_reason,
        provider: row.provider,
        errorMessage: row.error_message,
    });
}
let ProxyMessageRecorder = ProxyMessageRecorder_1 = class ProxyMessageRecorder {
    messageRepo;
    pricingCache;
    eventBus;
    customProviders;
    opencodeGoCatalog;
    providerService;
    logger = new common_1.Logger(ProxyMessageRecorder_1.name);
    rateLimitCooldown = new Map();
    RATE_LIMIT_COOLDOWN_MS = 60_000;
    MAX_COOLDOWN_ENTRIES = 1_000;
    cooldownCleanupTimer;
    constructor(messageRepo, pricingCache, eventBus, customProviders, opencodeGoCatalog, providerService) {
        this.messageRepo = messageRepo;
        this.pricingCache = pricingCache;
        this.eventBus = eventBus;
        this.customProviders = customProviders;
        this.opencodeGoCatalog = opencodeGoCatalog;
        this.providerService = providerService;
        this.cooldownCleanupTimer = setInterval(() => this.evictExpiredCooldowns(), 60_000);
        if (typeof this.cooldownCleanupTimer === 'object' && 'unref' in this.cooldownCleanupTimer) {
            this.cooldownCleanupTimer.unref();
        }
    }
    onModuleDestroy() {
        clearInterval(this.cooldownCleanupTimer);
    }
    isCopilotSubscription(provider, authType) {
        if (authType !== 'subscription' || !provider)
            return false;
        return providers_1.PROVIDER_BY_ID_OR_ALIAS.get(provider.toLowerCase())?.id === 'copilot';
    }
    async copilotTokenPricing(ctx, tenantProviderId, model, promptTokens) {
        if (!tenantProviderId || !this.providerService)
            return undefined;
        let providers;
        try {
            providers = await this.providerService.getProviders(ctx.tenantId);
        }
        catch {
            return undefined;
        }
        const connection = providers.find((candidate) => candidate.id === tenantProviderId);
        const bareModel = model.toLowerCase().replace(/^copilot\//, '');
        const cached = Array.isArray(connection?.cached_models)
            ? connection.cached_models.find((candidate) => candidate.id.toLowerCase().replace(/^copilot\//, '') === bareModel)
            : undefined;
        const validPrice = (price) => typeof price === 'number' && Number.isFinite(price) && price >= 0;
        if (!cached ||
            !validPrice(cached.inputPricePerToken) ||
            !validPrice(cached.outputPricePerToken)) {
            return undefined;
        }
        const longContext = cached.longContextPricing;
        const useLongContext = longContext != null &&
            Number.isSafeInteger(longContext.thresholdTokens) &&
            longContext.thresholdTokens > 0 &&
            promptTokens > longContext.thresholdTokens &&
            validPrice(longContext.inputPricePerToken) &&
            validPrice(longContext.outputPricePerToken) &&
            (longContext.inputPricePerToken > 0 || longContext.outputPricePerToken > 0);
        const effective = useLongContext ? longContext : cached;
        if (effective.inputPricePerToken === 0 && effective.outputPricePerToken === 0) {
            return undefined;
        }
        return {
            model_name: cached.id,
            provider: connection?.provider ?? 'copilot',
            input_price_per_token: effective.inputPricePerToken,
            output_price_per_token: effective.outputPricePerToken,
            cache_read_price_per_token: effective.cacheReadPricePerToken,
            cache_write_price_per_token: effective.cacheWritePricePerToken,
            display_name: cached.displayName || null,
        };
    }
    async computeCost(ctx, model, provider, authType, usage, tenantProviderId, canonicalProvider, at) {
        const isCopilot = this.isCopilotSubscription(provider, authType);
        const copilotPricing = isCopilot && usage
            ? await this.copilotTokenPricing(ctx, tenantProviderId, model, usage.prompt_tokens)
            : undefined;
        return (0, cost_calculator_1.computeTokenCost)({
            inputTokens: usage?.prompt_tokens ?? 0,
            outputTokens: usage?.completion_tokens ?? 0,
            cacheReadTokens: usage?.cache_read_tokens ?? 0,
            cacheCreationTokens: usage?.cache_creation_tokens ?? 0,
            model,
            pricing: copilotPricing ??
                (!isCopilot && usage ? this.pricingCache.getByModel(model, provider) : undefined),
            isSubscription: authType === 'subscription' && !copilotPricing,
            isLocalProvider: (0, provider_availability_1.isLocalOnlyProvider)(canonicalProvider ?? provider ?? ''),
            perRequestCostUsd: copilotPricing
                ? null
                : await this.perRequestSubscriptionCost(provider, authType, model),
            reportedCostUsd: isCopilot ? undefined : usage?.reported_cost_usd,
            at,
        });
    }
    async persistRequest(ctx, requestId, attempt, terminal, autofix, apiMode) {
        const getRepository = this.messageRepo.manager?.getRepository?.bind(this.messageRepo.manager);
        if (!getRepository)
            return false;
        const repo = getRepository(request_entity_1.ManifestRequest);
        if (typeof repo.createQueryBuilder !== 'function')
            return false;
        const row = buildRequestRow(ctx, requestId, attempt, terminal, autofix, apiMode);
        const insert = repo.createQueryBuilder().insert().into(request_entity_1.ManifestRequest).values(row);
        if (terminal) {
            const updatedColumns = [
                'user_id',
                'agent_name',
                'trace_id',
                'session_key',
                'session_id',
                'duration_ms',
                'status',
                'autofix_status',
                'error_message',
                'error_http_status',
                'error_code',
                'error_origin',
                'error_class',
                'caller_attribution',
                'request_headers',
                'request_params',
                ...(apiMode == null ? [] : ['api_mode']),
            ];
            await insert.orUpdate(updatedColumns, ['id']).execute();
        }
        else {
            await insert.orIgnore().execute();
        }
        return true;
    }
    async persistAttempt(row, attempt) {
        const terminalRow = attempt
            ? {
                ...row,
                ...attemptIdentity(attempt, attempt.attemptNumber),
                duration_ms: Math.max(0, (attempt.completedAtMs ?? Date.now()) - attempt.startedAtMs),
            }
            : row;
        if (!attempt || !(await attempt.pendingWrite.catch(() => false))) {
            await this.messageRepo.insert(terminalRow);
            return;
        }
        const payload = { ...terminalRow };
        delete payload.id;
        await this.messageRepo.update({ id: attempt.id }, payload);
    }
    shouldSkipRateLimitRecord(ctx, scope) {
        const key = scope
            ? `${scope}:${ctx.tenantId}:${ctx.agentId}`
            : `${ctx.tenantId}:${ctx.agentId}`;
        const now = Date.now();
        const lastRecorded = this.rateLimitCooldown.get(key) ?? 0;
        if (now - lastRecorded < this.RATE_LIMIT_COOLDOWN_MS)
            return true;
        this.rateLimitCooldown.set(key, now);
        if (this.rateLimitCooldown.size > this.MAX_COOLDOWN_ENTRIES) {
            for (const [k, v] of this.rateLimitCooldown) {
                if (now - v >= this.RATE_LIMIT_COOLDOWN_MS)
                    this.rateLimitCooldown.delete(k);
            }
        }
        return false;
    }
    async recordPendingRequest(ctx, opts) {
        await this.persistRequest(ctx, opts.requestId, {
            trace_id: opts.traceId ?? null,
            session_key: opts.sessionKey ?? null,
            timestamp: opts.timestamp,
            status: manifest_shared_1.PENDING_STATUS,
            model: opts.requestedModel ?? null,
            caller_attribution: opts.callerAttribution ?? null,
            request_headers: opts.requestHeaders ?? null,
        }, false, undefined, opts.apiMode);
    }
    async recordPendingProviderAttempt(ctx, requestId, attempt, start) {
        const canonical = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, start.provider, start.model);
        await this.messageRepo.insert(buildMessageRow(ctx, {
            id: attempt.id,
            request_id: requestId,
            attempt_number: attempt.attemptNumber,
            timestamp: attempt.startedAt,
            status: manifest_shared_1.PENDING_STATUS,
            model: canonical.model,
            provider: canonical.provider,
            auth_type: start.authType ?? null,
            tenant_provider_id: start.tenantProviderId ?? null,
            provider_key_label: start.keyLabel ?? null,
        }));
        return true;
    }
    async recordCancelledRequest(ctx, opts) {
        const row = buildMessageRow(ctx, {
            request_id: opts.requestId,
            ...attemptIdentity(opts.attempt, opts.attempt?.attemptNumber),
            timestamp: new Date().toISOString(),
            duration_ms: opts.requestDurationMs ?? null,
            status: manifest_shared_1.CANCELLED_STATUS,
            trace_id: opts.traceId ?? null,
            provider: opts.attemptStart?.provider ?? null,
            model: opts.attemptStart?.model ?? null,
            auth_type: opts.attemptStart?.authType ?? null,
            tenant_provider_id: opts.attemptStart?.tenantProviderId ?? null,
            provider_key_label: opts.attemptStart?.keyLabel ?? null,
            error_message: null,
            error_http_status: null,
        });
        await this.persistRequest(ctx, opts.requestId, row, true, undefined, opts.apiMode);
        if (opts.attempt)
            await this.persistAttempt(row, opts.attempt);
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async cancelPendingProviderAttempts(attempts) {
        await Promise.all(attempts.map(async (attempt) => {
            if (!(await attempt.pendingWrite.catch(() => false)))
                return;
            await this.messageRepo
                .update({ id: attempt.id, status: manifest_shared_1.PENDING_STATUS }, {
                status: manifest_shared_1.CANCELLED_STATUS,
                error_message: null,
                error_code: null,
                error_http_status: null,
                duration_ms: Math.max(0, (attempt.completedAtMs ?? Date.now()) - attempt.startedAtMs),
            })
                .catch((e) => this.logger.warn(`Failed to cancel Provider Attempt ${attempt.id}: ${e}`));
        }));
    }
    async completePendingProviderFailure(attempt, status, errorBody, superseded) {
        if (!(await attempt.pendingWrite.catch(() => false)))
            return;
        const richStatus = superseded ? 'fallback_error' : status === 429 ? 'rate_limited' : 'error';
        const classified = classifyRow({
            status: richStatus,
            error_http_status: status,
        });
        const errorMessage = (0, secret_scrub_1.scrubSecrets)(errorBody).trim().slice(0, 2000) || exports.FAILED_WITHOUT_MESSAGE;
        await this.messageRepo.update({ id: attempt.id }, {
            status: (0, manifest_shared_1.normalizeStatus)(richStatus),
            error_message: errorMessage,
            error_code: (0, error_codes_1.extractManifestErrorCode)(errorMessage),
            error_http_status: status,
            duration_ms: Math.max(0, (attempt.completedAtMs ?? Date.now()) - attempt.startedAtMs),
            ...classified,
        });
    }
    async recordProviderError(ctx, httpStatus, errorMessage, opts) {
        const { requestId = (0, uuid_1.v4)(), attemptNumber, attempt, skipAttempt = false, requestDurationMs, model, provider, tier, traceId, fallbackFromModel, fallbackIndex, authType, reason, specificityCategory, providerKeyLabel, tenantProviderId, callerAttribution, requestHeaders, requestParams, headerTierId, headerTierName, headerTierColor, autofix, apiMode, } = opts ?? {};
        if (httpStatus === 429 &&
            !attempt &&
            !skipAttempt &&
            !(0, autofix_types_1.getAutofixRetry)(autofix) &&
            this.shouldSkipRateLimitRecord(ctx)) {
            return;
        }
        const messageStatus = httpStatus === 429 ? 'rate_limited' : 'error';
        const canonical = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, provider, model);
        const row = buildMessageRow(ctx, {
            request_id: requestId,
            ...attemptIdentity(attempt, attemptNumber),
            trace_id: traceId ?? null,
            timestamp: new Date().toISOString(),
            duration_ms: requestDurationMs ?? null,
            status: messageStatus,
            error_message: (0, secret_scrub_1.scrubSecrets)((0, proxy_error_sanitizer_1.normalizeProviderErrorForStorage)(httpStatus, errorMessage)).slice(0, 2000),
            error_http_status: httpStatus,
            ...autofixColumns(autofix, terminalAutofixRole(autofix)),
            model: canonical.model,
            provider: canonical.provider,
            routing_tier: tier ?? null,
            routing_reason: skipAttempt ? 'provider_cooldown' : (reason ?? null),
            fallback_from_model: fallbackFromModel ?? null,
            fallback_index: fallbackIndex ?? null,
            auth_type: authType ?? null,
            specificity_category: specificityCategory ?? null,
            provider_key_label: providerKeyLabel ?? null,
            tenant_provider_id: tenantProviderId ?? null,
            caller_attribution: callerAttribution ?? null,
            request_headers: requestHeaders ?? null,
            request_params: requestParams ?? null,
            header_tier_id: headerTierId ?? null,
            header_tier_name: headerTierName ?? null,
            header_tier_color: headerTierColor ?? null,
        });
        await this.persistRequest(ctx, requestId, row, true, autofix, apiMode);
        await this.persistAttempt(row, attempt);
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async recordManifestBlockedRequest(ctx, opts) {
        const { requestId = (0, uuid_1.v4)(), httpStatus, errorMessage, errorCode, reason, model, traceId, sessionKey, callerAttribution, requestHeaders, autofix, durationMs, attempt, apiMode, routing, } = opts;
        const canonical = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, null, model ?? null);
        const row = buildMessageRow(ctx, {
            request_id: requestId,
            trace_id: traceId ?? null,
            session_key: sessionKey ?? null,
            timestamp: new Date().toISOString(),
            duration_ms: durationMs ?? null,
            status: httpStatus === 429 ? 'rate_limited' : 'error',
            ...autofixColumns(autofix, 'original'),
            error_message: (0, secret_scrub_1.scrubSecrets)(errorMessage).slice(0, 2000),
            error_code: errorCode ?? null,
            error_http_status: httpStatus ?? null,
            model: canonical.model,
            provider: null,
            routing_tier: routing?.tier ?? null,
            routing_reason: reason,
            fallback_from_model: null,
            fallback_index: null,
            auth_type: null,
            specificity_category: routing?.specificityCategory ?? null,
            provider_key_label: null,
            tenant_provider_id: null,
            caller_attribution: callerAttribution ?? null,
            request_headers: requestHeaders ?? null,
            request_params: null,
            header_tier_id: routing?.headerTierId ?? null,
            header_tier_name: routing?.headerTierName ?? null,
            header_tier_color: routing?.headerTierColor ?? null,
        });
        await this.persistRequest(ctx, requestId, row, true, autofix, apiMode);
        const retry = (0, autofix_types_1.getAutofixRetry)(autofix);
        if (attempt && retry?.error) {
            await attempt.completeFailure?.({
                status: retry.http_status,
                errorBody: (0, provider_error_normalizer_1.serializeProviderError)(retry.error),
                superseded: false,
            });
        }
        await this.persistAttempt(row);
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async recordFailedFallbacks(ctx, tier, primaryModel, failures, opts) {
        const { traceId, requestId = (0, uuid_1.v4)(), firstAttemptNumber, baseTimeMs, markHandled = false, lastAsError = false, authType, providerKeyLabel, reason, callerAttribution, requestHeaders, requestParams, headerTierId, headerTierName, headerTierColor, } = opts ?? {};
        if (failures.length === 0)
            return;
        const canonicalPrimary = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, null, primaryModel);
        const canonicalFailures = await Promise.all(failures.map((f) => this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, f.provider, f.model)));
        const rows = [];
        for (let i = 0; i < failures.length; i++) {
            const f = failures[i];
            const ts = baseTimeMs
                ? new Date(baseTimeMs + (failures.length - i) * 100).toISOString()
                : new Date().toISOString();
            const isLast = i === failures.length - 1;
            const useHandledStatus = markHandled && !(lastAsError && isLast);
            const status = useHandledStatus
                ? 'fallback_error'
                : f.status === 429
                    ? 'rate_limited'
                    : 'error';
            const canonical = canonicalFailures[i];
            const recordedAuth = f.authType ?? authType ?? null;
            const errorMessage = (0, secret_scrub_1.scrubSecrets)((0, proxy_error_sanitizer_1.normalizeProviderErrorForStorage)(f.status, f.errorBody)).slice(0, 2000);
            rows.push(buildMessageRow(ctx, {
                request_id: requestId,
                ...attemptIdentity(f.attempt, firstAttemptNumber == null ? undefined : firstAttemptNumber + i),
                trace_id: traceId ?? null,
                timestamp: ts,
                status,
                error_message: errorMessage,
                error_code: (0, error_codes_1.extractManifestErrorCode)(errorMessage) ?? (0, error_codes_1.extractManifestErrorCode)(f.errorBody),
                error_http_status: f.status,
                model: canonical.model,
                provider: canonical.provider,
                routing_tier: tier,
                routing_reason: f.providerCallStarted === false ? 'provider_cooldown' : (reason ?? null),
                fallback_from_model: canonicalPrimary.model,
                fallback_index: f.fallbackIndex,
                auth_type: recordedAuth,
                tenant_provider_id: f.tenantProviderId ?? null,
                provider_key_label: f.keyLabel ?? providerKeyLabel ?? null,
                caller_attribution: callerAttribution ?? null,
                request_headers: requestHeaders ?? null,
                request_params: requestParams ?? null,
                header_tier_id: headerTierId ?? null,
                header_tier_name: headerTierName ?? null,
                header_tier_color: headerTierColor ?? null,
                ...autofixColumns(f.autofix, f.autofixRole ?? 'original'),
            }));
        }
        await this.persistRequest(ctx, requestId, rows[rows.length - 1], false);
        if (failures.every((failure) => !failure.attempt)) {
            await this.messageRepo.insert(rows);
        }
        else {
            await Promise.all(rows.map((row, index) => this.persistAttempt(row, failures[index].attempt)));
        }
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async recordPrimaryFailure(ctx, tier, model, errorBody, timestamp, authType, opts) {
        const canonical = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, opts?.provider, model);
        const requestId = opts?.requestId ?? (0, uuid_1.v4)();
        const errorMessage = (0, secret_scrub_1.scrubSecrets)((0, proxy_error_sanitizer_1.normalizeProviderErrorForStorage)(opts?.httpStatus, errorBody)).slice(0, 2000);
        const row = buildMessageRow(ctx, {
            request_id: requestId,
            ...attemptIdentity(opts?.attempt, opts?.attemptNumber),
            timestamp,
            duration_ms: opts?.requestDurationMs ?? null,
            status: 'fallback_error',
            ...autofixColumns(opts?.autofix, terminalAutofixRole(opts?.autofix)),
            error_message: errorMessage,
            error_code: (0, error_codes_1.extractManifestErrorCode)(errorMessage) ?? (0, error_codes_1.extractManifestErrorCode)(errorBody),
            error_http_status: opts?.httpStatus ?? null,
            model: canonical.model,
            provider: canonical.provider,
            routing_tier: tier,
            routing_reason: opts?.skipAttempt ? 'provider_cooldown' : (opts?.reason ?? null),
            fallback_from_model: null,
            fallback_index: null,
            auth_type: authType ?? null,
            tenant_provider_id: opts?.tenantProviderId ?? null,
            provider_key_label: opts?.providerKeyLabel ?? null,
            caller_attribution: opts?.callerAttribution ?? null,
            request_headers: opts?.requestHeaders ?? null,
            request_params: opts?.requestParams ?? null,
            header_tier_id: opts?.headerTierId ?? null,
            header_tier_name: opts?.headerTierName ?? null,
            header_tier_color: opts?.headerTierColor ?? null,
        });
        const requestOutcome = opts?.terminalHttpStatus
            ? {
                ...row,
                status: opts.terminalHttpStatus === 429 ? 'rate_limited' : 'error',
                error_http_status: opts.terminalHttpStatus,
            }
            : row;
        await this.persistRequest(ctx, requestId, requestOutcome, Boolean(opts?.terminalHttpStatus), opts?.autofix, opts?.apiMode);
        await this.persistAttempt(row, opts?.attempt);
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async recordFallbackSuccess(ctx, model, tier, opts) {
        const { requestId = (0, uuid_1.v4)(), attemptNumber, attempt, requestDurationMs, traceId, provider, fallbackFromModel, fallbackIndex, timestamp, authType, reason, providerKeyLabel, tenantProviderId, usage, callerAttribution, requestHeaders, requestParams, headerTierId, headerTierName, headerTierColor, autofix, fallbackAutofix, apiMode, } = opts ?? {};
        const inputTokens = usage?.prompt_tokens ?? 0;
        const outputTokens = usage?.completion_tokens ?? 0;
        const canonical = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, provider, model);
        const costUsd = await this.computeCost(ctx, model, provider, authType, usage, tenantProviderId, canonical.provider, attempt ? new Date(attempt.startedAt) : timestamp ? new Date(timestamp) : undefined);
        const canonicalFallbackFrom = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, null, fallbackFromModel);
        const row = buildMessageRow(ctx, {
            request_id: requestId,
            ...attemptIdentity(attempt, attemptNumber),
            trace_id: traceId ?? null,
            timestamp: timestamp ?? new Date().toISOString(),
            duration_ms: requestDurationMs ?? null,
            status: 'ok',
            model: canonical.model,
            provider: canonical.provider,
            routing_tier: tier,
            routing_reason: reason ?? null,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cache_read_tokens: usage?.cache_read_tokens ?? 0,
            cache_creation_tokens: usage?.cache_creation_tokens ?? 0,
            cost_usd: costUsd,
            auth_type: authType ?? null,
            fallback_from_model: canonicalFallbackFrom.model,
            fallback_index: fallbackIndex ?? null,
            provider_key_label: providerKeyLabel ?? null,
            tenant_provider_id: tenantProviderId ?? null,
            caller_attribution: callerAttribution ?? null,
            request_headers: requestHeaders ?? null,
            request_params: requestParams ?? null,
            header_tier_id: headerTierId ?? null,
            header_tier_name: headerTierName ?? null,
            header_tier_color: headerTierColor ?? null,
            ...autofixColumns(fallbackAutofix, 'retry'),
        });
        await this.persistRequest(ctx, requestId, row, true, fallbackAutofix ?? autofix, apiMode);
        await this.persistAttempt(row, attempt);
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async recordSuccessMessage(ctx, model, tier, reason, usage, opts) {
        const { requestId: providedRequestId, attemptNumber, attempt, traceId, provider, authType, sessionKey, durationMs, specificityCategory, providerKeyLabel, tenantProviderId, callerAttribution, requestHeaders, requestParams, headerTierId, headerTierName, headerTierColor, autofix, apiMode, } = opts ?? {};
        const requestId = providedRequestId ?? (0, uuid_1.v4)();
        const canonical = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, provider, model);
        const costUsd = await this.computeCost(ctx, model, provider, authType, usage, tenantProviderId, canonical.provider, attempt ? new Date(attempt.startedAt) : undefined);
        const canonicalModel = canonical.model;
        const canonicalProvider = canonical.provider;
        const normalizedSessionKey = normalizeSessionKey(sessionKey);
        const status = 'ok';
        const errorMessage = null;
        const requestRow = buildMessageRow(ctx, {
            request_id: requestId,
            ...attemptIdentity(attempt, attemptNumber),
            trace_id: traceId ?? null,
            session_key: normalizedSessionKey,
            timestamp: new Date().toISOString(),
            status,
            error_message: errorMessage,
            model: canonicalModel,
            provider: canonicalProvider,
            routing_tier: tier,
            routing_reason: reason,
            duration_ms: durationMs ?? null,
            caller_attribution: callerAttribution ?? null,
            request_headers: requestHeaders ?? null,
            request_params: requestParams ?? null,
            input_tokens: usage.prompt_tokens,
            output_tokens: usage.completion_tokens,
            cache_read_tokens: usage.cache_read_tokens ?? 0,
            cache_creation_tokens: usage.cache_creation_tokens ?? 0,
            cost_usd: costUsd,
            auth_type: authType ?? null,
            specificity_category: specificityCategory ?? null,
            provider_key_label: providerKeyLabel ?? null,
            tenant_provider_id: tenantProviderId ?? null,
            header_tier_id: headerTierId ?? null,
            header_tier_name: headerTierName ?? null,
            header_tier_color: headerTierColor ?? null,
            ...autofixColumns(autofix, 'retry'),
        });
        await this.persistRequest(ctx, requestId, requestRow, true, autofix, apiMode);
        await this.persistAttempt(requestRow, attempt);
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async recordAutofixOriginal(ctx, model, tier, autofix, opts) {
        if (!(0, autofix_types_1.getAutofixRetry)(autofix))
            return;
        const original = autofix.chain.find((entry) => entry.origin === 'original' && entry.error);
        if (!original?.error)
            return;
        const canonical = await this.customProviders.canonicalizeAgentMessageKeys(ctx.tenantId, opts?.provider, model);
        const requestId = opts?.requestId ?? (0, uuid_1.v4)();
        const row = buildMessageRow(ctx, {
            request_id: requestId,
            ...attemptIdentity(opts?.attempt, opts?.attemptNumber),
            trace_id: opts?.traceId ?? null,
            timestamp: new Date(Date.now() - 1000).toISOString(),
            status: 'auto_fixed',
            error_message: (0, provider_error_normalizer_1.serializeProviderError)(original.error),
            error_http_status: original.http_status,
            model: canonical.model,
            provider: canonical.provider,
            routing_tier: tier ?? null,
            routing_reason: opts?.reason ?? null,
            auth_type: opts?.authType ?? null,
            specificity_category: opts?.specificityCategory ?? null,
            provider_key_label: opts?.providerKeyLabel ?? null,
            tenant_provider_id: opts?.tenantProviderId ?? null,
            caller_attribution: opts?.callerAttribution ?? null,
            request_headers: opts?.requestHeaders ?? null,
            request_params: opts?.requestParams ?? null,
            header_tier_id: opts?.headerTierId ?? null,
            header_tier_name: opts?.headerTierName ?? null,
            header_tier_color: opts?.headerTierColor ?? null,
            autofix_applied: true,
            autofix_group_id: autofix.groupId,
            autofix_role: 'original',
            autofix_operations: original.operations ?? null,
            autofix_decision: buildAutofixDecision(original),
        });
        await this.persistRequest(ctx, requestId, row, false, autofix);
        await this.persistAttempt(row, opts?.attempt);
        this.eventBus.emit(ctx.tenantId, 'message', ctx.userId);
    }
    async perRequestSubscriptionCost(provider, authType, model) {
        if (authType !== 'subscription')
            return null;
        if (!provider)
            return null;
        const canonical = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(provider.toLowerCase())?.id;
        if (canonical !== 'opencode-go')
            return null;
        return this.opencodeGoCatalog.resolveCostPerRequest(model);
    }
    evictExpiredCooldowns() {
        const now = Date.now();
        for (const [k, v] of this.rateLimitCooldown) {
            if (now - v >= this.RATE_LIMIT_COOLDOWN_MS)
                this.rateLimitCooldown.delete(k);
        }
    }
};
exports.ProxyMessageRecorder = ProxyMessageRecorder;
exports.ProxyMessageRecorder = ProxyMessageRecorder = ProxyMessageRecorder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        model_pricing_cache_service_1.ModelPricingCacheService,
        ingest_event_bus_service_1.IngestEventBusService,
        custom_provider_service_1.CustomProviderService,
        opencode_go_catalog_service_1.OpencodeGoCatalogService,
        provider_service_1.ProviderService])
], ProxyMessageRecorder);
//# sourceMappingURL=proxy-message-recorder.js.map