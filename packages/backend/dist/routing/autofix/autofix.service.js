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
var AutofixService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutofixService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const manifest_shared_1 = require("manifest-shared");
const agent_entity_1 = require("../../entities/agent.entity");
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
const healing_client_1 = require("./healing-client");
const provider_error_normalizer_1 = require("./provider-error-normalizer");
const secret_scrub_1 = require("../../common/utils/secret-scrub");
const observation_payload_1 = require("./observation-payload");
const attempt_recording_capture_1 = require("../proxy/attempt-recording-capture");
const DEFAULT_REPAIRABLE_STATUSES = '400,404,422';
const HEAL_FAILURE_THRESHOLD = 3;
const BREAKER_COOLDOWN_MS = 30_000;
const OUTCOME_RESEND_DELAYS_MS = [1_000, 5_000];
function parseStatuses(raw) {
    const source = raw && raw.trim().length > 0 ? raw : DEFAULT_REPAIRABLE_STATUSES;
    const parsed = source
        .split(',')
        .map((s) => s.trim())
        .filter((s) => /^\d+$/.test(s))
        .map((s) => Number.parseInt(s, 10))
        .filter((n) => n >= 400 && n < 500);
    return new Set(parsed.length > 0 ? parsed : DEFAULT_REPAIRABLE_STATUSES.split(',').map(Number));
}
function headersToObject(headers) {
    const out = {};
    headers.forEach((value, key) => {
        out[key] = value;
    });
    return out;
}
function parseProviderBody(raw) {
    const scrubbed = (0, secret_scrub_1.scrubSecrets)(raw);
    try {
        return JSON.parse(scrubbed);
    }
    catch {
        return scrubbed;
    }
}
function rebuildForward(base, body, status) {
    return {
        ...base,
        response: new Response(body, { status, headers: headersToObject(base.response.headers) }),
    };
}
let AutofixService = AutofixService_1 = class AutofixService {
    client;
    agentRepo;
    logger = new common_1.Logger(AutofixService_1.name);
    globalEnabled;
    defaultAgentEnabled;
    repairableStatuses;
    configLoads = new Map();
    configLoadGeneration = 0;
    healFailureStreak = 0;
    breakerOpenUntil = 0;
    constructor(client, agentRepo, config) {
        this.client = client;
        this.agentRepo = agentRepo;
        this.globalEnabled = config.get('AUTOFIX_GLOBAL_ENABLED') !== 'false';
        this.defaultAgentEnabled = !(0, detect_self_hosted_1.isSelfHosted)();
        this.repairableStatuses = parseStatuses(config.get('AUTOFIX_REPAIRABLE_STATUSES'));
        this.logger.log(`config: globalEnabled=${this.globalEnabled} ` +
            `defaultAgentEnabled=${this.defaultAgentEnabled} ` +
            `repairableStatuses=[${[...this.repairableStatuses].join(',')}]`);
    }
    resolveEnabled(stored) {
        return stored ?? this.defaultAgentEnabled;
    }
    isRepairable(status) {
        return this.repairableStatuses.has(status);
    }
    async isActiveFor(tenantId, agentId) {
        return (await this.getHealingContext(tenantId, agentId)) !== null;
    }
    async getHealingContext(tenantId, agentId) {
        if (!this.globalEnabled)
            return null;
        const cfg = await this.loadAgentConfig(agentId, tenantId);
        return cfg.enabled ? { harness: cfg.harness } : null;
    }
    recordHealSuccess() {
        this.healFailureStreak = 0;
    }
    recordHealFailure() {
        this.healFailureStreak += 1;
        if (this.healFailureStreak >= HEAL_FAILURE_THRESHOLD) {
            this.breakerOpenUntil = Date.now() + BREAKER_COOLDOWN_MS;
            this.healFailureStreak = 0;
            this.logger.warn(`autofix: healing service unreachable — circuit breaker open for ${BREAKER_COOLDOWN_MS}ms`);
        }
    }
    async maybeHeal(params) {
        const { forward } = params;
        if (forward.response.ok)
            return null;
        const status = forward.response.status;
        this.logger.log(`maybeHeal: failed forward status=${status} agent=${params.agentId} ` +
            `tenant=${params.tenantId} globalEnabled=${this.globalEnabled}`);
        if (!this.globalEnabled) {
            this.logger.warn(`skip status=${status}: globally disabled (AUTOFIX_GLOBAL_ENABLED=false)`);
            return null;
        }
        if (!this.isRepairable(status)) {
            this.logger.log(`skip status=${status}: not in repairable set [${[...this.repairableStatuses].join(',')}]`);
            return null;
        }
        if (status === 400 && params.provider.trim().toLowerCase() === 'anthropic') {
            try {
                const errorBody = await forward.response.clone().text();
                if ((0, manifest_shared_1.isAnthropicExtraUsageError)({
                    provider: params.provider,
                    httpStatus: status,
                    errorBody,
                })) {
                    this.logger.log(`skip status=${status}: Anthropic subscription billing exhaustion`);
                    return null;
                }
            }
            catch (err) {
                this.logger.warn(`could not inspect Anthropic 400 for billing semantics: ${err.message}`);
            }
        }
        if (this.breakerOpenUntil > Date.now()) {
            this.logger.warn(`skip status=${status}: circuit breaker open`);
            return null;
        }
        let cfg;
        try {
            cfg = await this.loadAgentConfig(params.agentId, params.tenantId);
        }
        catch (err) {
            this.logger.warn(`autofix config load failed, skipping: ${err.message}`);
            return null;
        }
        if (!cfg.enabled) {
            this.logger.log(`skip status=${status}: agent ${params.agentId} tenant ${params.tenantId} ` +
                `disabled (defaultAgentEnabled=${this.defaultAgentEnabled})`);
            return null;
        }
        this.logger.log(`healing status=${status} agent=${params.agentId} ` +
            `tenant=${params.tenantId} provider=${params.provider}`);
        const originalText = await forward.response.text();
        await forward.attempt?.finishRecording?.((0, attempt_recording_capture_1.recordingResponseFromText)(originalText));
        const originalForward = rebuildForward(forward, originalText, status);
        try {
            return await this.runHealOnce(params, cfg, status, originalText, originalForward);
        }
        catch (err) {
            this.logger.warn(`autofix failed, using original error: ${err.message}`);
            return {
                forward: originalForward,
                record: { groupId: (0, uuid_1.v4)(), outcome: 'exhausted', original_http_status: status, chain: [] },
            };
        }
    }
    async runHealOnce(params, config, status, originalText, originalForward) {
        const groupId = (0, uuid_1.v4)();
        const normalized = (0, provider_error_normalizer_1.normalizeProviderError)(originalText);
        const entry = {
            attempt: 0,
            origin: 'original',
            request: params.requestBody,
            http_status: status,
            error: normalized,
        };
        const chain = [entry];
        let heal;
        try {
            heal = await this.client.heal({
                traceId: groupId,
                tenantId: params.tenantId,
                provider: params.provider,
                model: params.model,
                authType: params.authType,
                api: params.apiMode,
                url: params.url,
                request: params.requestBody,
                response: { statusCode: status, error: normalized },
                ...(originalForward.wireFormat
                    ? {
                        providerExchange: {
                            format: originalForward.wireFormat,
                            ...(originalForward.wireRequestUrl
                                ? { url: (0, observation_payload_1.scrubProviderUrl)(originalForward.wireRequestUrl) }
                                : {}),
                            request: { body: params.requestBody, redactedFields: [] },
                            response: {
                                statusCode: status,
                                body: parseProviderBody(originalText),
                            },
                        },
                    }
                    : {}),
            }, { harness: config.harness });
        }
        catch (err) {
            if (err instanceof healing_client_1.HealContractError) {
                this.logger.error(`autofix: Phoenix rejected the heal request (HTTP ${err.status}) — check the ` +
                    `wire contract and AUTOFIX_HEALING_API_KEY: ${err.message}`);
            }
            else {
                this.recordHealFailure();
                this.logger.warn(`heal call failed: ${err.message}`);
            }
            return {
                forward: originalForward,
                record: { groupId, outcome: 'exhausted', original_http_status: status, chain },
            };
        }
        this.recordHealSuccess();
        entry.phoenix_status = heal.status;
        entry.issue_id = heal.issueId;
        entry.patch_id = heal.patchId ?? null;
        entry.heal_attempt_id = heal.healAttemptId ?? null;
        entry.operations = heal.operations ?? null;
        entry.explanation = heal.explanation ?? null;
        if (heal.status === 'resolving') {
            return {
                forward: originalForward,
                record: { groupId, outcome: 'resolving', original_http_status: status, chain },
            };
        }
        if (heal.status === 'no_patch' || !heal.healedBody || !heal.healAttemptId) {
            return {
                forward: originalForward,
                record: { groupId, outcome: 'unfixable', original_http_status: status, chain },
            };
        }
        const healAttemptId = heal.healAttemptId;
        const healedBody = heal.healedBody;
        let next;
        try {
            next = await params.reforward(healedBody);
        }
        catch (err) {
            this.logger.warn(`autofix reforward failed, using original error: ${err.message}`);
            entry.patch_worked = false;
            this.reportOutcome(healAttemptId, {
                retryStatusCode: 499,
                error: {
                    message: `patched retry never completed: ${err.message}`,
                    type: 'retry_not_completed',
                },
            }, config.harness);
            return {
                forward: originalForward,
                record: { groupId, outcome: 'unfixable', original_http_status: status, chain },
            };
        }
        const ok = next.response.ok;
        entry.patch_worked = ok;
        if (ok) {
            this.reportOutcome(healAttemptId, { retryStatusCode: next.response.status }, config.harness);
            chain.push({
                attempt: 1,
                origin: 'autofix',
                request: healedBody,
                http_status: next.response.status,
            });
            return {
                forward: next,
                record: { groupId, outcome: 'healed', original_http_status: status, chain },
            };
        }
        const retryText = await next.response.text();
        const retryError = (0, provider_error_normalizer_1.normalizeProviderError)(retryText);
        chain.push({
            attempt: 1,
            origin: 'autofix',
            request: healedBody,
            http_status: next.response.status,
            error: retryError,
        });
        this.reportOutcome(healAttemptId, {
            retryStatusCode: next.response.status,
            error: retryError,
        }, config.harness);
        return {
            forward: rebuildForward(next, retryText, next.response.status),
            record: { groupId, outcome: 'exhausted', original_http_status: status, chain },
        };
    }
    async loadAgentConfig(agentId, tenantId) {
        const key = `${tenantId}:${agentId}`;
        const existing = this.configLoads.get(key);
        const minimumGeneration = existing ? existing.generation + 1 : 0;
        return this.loadAgentConfigGeneration(agentId, tenantId, key, minimumGeneration);
    }
    async loadAgentConfigGeneration(agentId, tenantId, key, minimumGeneration) {
        const existing = this.configLoads.get(key);
        if (existing) {
            if (existing.generation >= minimumGeneration)
                return existing.promise;
            try {
                await existing.promise;
            }
            catch {
            }
            if (this.configLoads.get(key) === existing)
                this.configLoads.delete(key);
            return this.loadAgentConfigGeneration(agentId, tenantId, key, minimumGeneration);
        }
        const promise = (async () => {
            const agent = await this.agentRepo.findOne({
                where: { id: agentId, tenant_id: tenantId },
                select: ['id', 'autofix_enabled', 'agent_platform'],
            });
            return {
                enabled: agent ? this.resolveEnabled(agent.autofix_enabled) : false,
                harness: (0, manifest_shared_1.coerceAgentPlatform)(agent?.agent_platform),
            };
        })();
        const load = { generation: ++this.configLoadGeneration, promise };
        this.configLoads.set(key, load);
        try {
            return await promise;
        }
        finally {
            if (this.configLoads.get(key) === load)
                this.configLoads.delete(key);
        }
    }
    reportOutcome(healAttemptId, outcome, harness) {
        void this.deliverOutcome(healAttemptId, outcome, harness);
    }
    async deliverOutcome(healAttemptId, outcome, harness) {
        for (let send = 0;; send++) {
            try {
                if ((await this.client.reportOutcome(healAttemptId, outcome, { harness })) !== null)
                    return;
            }
            catch (err) {
                this.logger.warn(`reportOutcome ${healAttemptId} failed: ${err.message}`);
            }
            const delay = OUTCOME_RESEND_DELAYS_MS[send];
            if (delay === undefined) {
                this.logger.warn(`reportOutcome ${healAttemptId}: giving up after ${send + 1} sends`);
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
};
exports.AutofixService = AutofixService;
exports.AutofixService = AutofixService = AutofixService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(healing_client_1.HEALING_CLIENT)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository,
        config_1.ConfigService])
], AutofixService);
//# sourceMappingURL=autofix.service.js.map