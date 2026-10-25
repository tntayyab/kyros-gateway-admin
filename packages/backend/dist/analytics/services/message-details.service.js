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
var MessageDetailsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDetailsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const manifest_shared_1 = require("manifest-shared");
const request_entity_1 = require("../../entities/request.entity");
const request_recording_storage_service_1 = require("../../common/services/request-recording-storage.service");
const request_recording_codec_1 = require("../../common/utils/request-recording-codec");
let MessageDetailsService = MessageDetailsService_1 = class MessageDetailsService {
    messageRepo;
    requestRepo;
    recordingStorage;
    logger = new common_1.Logger(MessageDetailsService_1.name);
    constructor(messageRepo, requestRepo, recordingStorage) {
        this.messageRepo = messageRepo;
        this.requestRepo = requestRepo;
        this.recordingStorage = recordingStorage;
    }
    async getDetails(messageId, tenantId) {
        if (!tenantId)
            throw new common_1.NotFoundException('Message not found');
        let request = this.requestRepo
            ? await this.requestRepo.findOne({ where: { id: messageId, tenant_id: tenantId } })
            : null;
        let attempts = request
            ? await this.messageRepo.find({
                where: { request_id: request.id, tenant_id: tenantId },
                order: { timestamp: 'ASC' },
            })
            : [];
        let message = request
            ? ([...attempts].reverse().find((attempt) => (0, manifest_shared_1.isSuccessStatus)(attempt.status)) ??
                attempts[attempts.length - 1] ??
                null)
            : await this.messageRepo
                .createQueryBuilder('m')
                .where('m.id = :id', { id: messageId })
                .andWhere('m.tenant_id = :tenantId', { tenantId })
                .getOne();
        if (!request && message?.request_id && this.requestRepo) {
            request = await this.requestRepo.findOne({
                where: { id: message.request_id, tenant_id: tenantId },
            });
            if (request) {
                attempts = await this.messageRepo.find({
                    where: { request_id: request.id, tenant_id: tenantId },
                    order: { timestamp: 'ASC' },
                });
                message =
                    [...attempts].reverse().find((attempt) => (0, manifest_shared_1.isSuccessStatus)(attempt.status)) ??
                        attempts[attempts.length - 1] ??
                        message;
            }
        }
        if (!message && !request)
            throw new common_1.NotFoundException('Message not found');
        const recordingsByAttempt = await this.loadAttemptRecordings(attempts);
        const autofix_sibling = message?.autofix_group_id
            ? await this.findAutofixSibling(message.id, message.autofix_group_id, tenantId)
            : null;
        const inputTokens = request
            ? attempts.reduce((sum, attempt) => sum + attempt.input_tokens, 0)
            : message.input_tokens;
        const outputTokens = request
            ? attempts.reduce((sum, attempt) => sum + attempt.output_tokens, 0)
            : message.output_tokens;
        const cacheReadTokens = request
            ? attempts.reduce((sum, attempt) => sum + attempt.cache_read_tokens, 0)
            : message.cache_read_tokens;
        const cacheCreationTokens = request
            ? attempts.reduce((sum, attempt) => sum + attempt.cache_creation_tokens, 0)
            : message.cache_creation_tokens;
        const cost = request
            ? attempts.reduce((sum, attempt) => sum + Number(attempt.cost_usd ?? 0), 0)
            : message.cost_usd;
        const duration = request
            ? attempts.length > 0
                ? attempts.reduce((sum, attempt) => sum + (attempt.duration_ms ?? 0), 0)
                : request.duration_ms
            : message.duration_ms;
        const response = {
            message: {
                id: request?.id ?? message.id,
                timestamp: request?.timestamp ?? message.timestamp,
                agent_name: request?.agent_name ?? message?.agent_name ?? null,
                model: message?.model ?? request?.requested_model ?? null,
                status: request?.status ?? message.status,
                autofix_status: request?.autofix_status ?? null,
                error_message: request?.error_message ?? message?.error_message ?? null,
                error_code: request ? (request.error_code ?? null) : message.error_code,
                error_http_status: request?.error_http_status ?? message?.error_http_status ?? null,
                error_origin: request?.error_origin ?? message?.error_origin ?? null,
                error_class: request?.error_class ?? message?.error_class ?? null,
                superseded: false,
                description: message?.description ?? null,
                service_type: message?.service_type ?? null,
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                cache_read_tokens: cacheReadTokens,
                cache_creation_tokens: cacheCreationTokens,
                cost_usd: cost,
                duration_ms: duration,
                trace_id: request?.trace_id ?? message?.trace_id ?? null,
                routing_tier: message?.routing_tier ?? null,
                routing_reason: message?.routing_reason ?? null,
                specificity_category: message?.specificity_category ?? null,
                specificity_miscategorized: message?.specificity_miscategorized ?? false,
                auth_type: message?.auth_type ?? null,
                provider_key_label: message?.provider_key_label ?? null,
                skill_name: message?.skill_name ?? null,
                fallback_from_model: message?.fallback_from_model ?? null,
                fallback_index: message?.fallback_index ?? null,
                session_key: request?.session_key ?? message?.session_key ?? null,
                feedback_rating: request?.feedback_rating ?? message?.feedback_rating ?? null,
                feedback_tags: (request?.feedback_tags ?? message?.feedback_tags)?.split(',') ?? null,
                feedback_details: request?.feedback_details ?? message?.feedback_details ?? null,
                request_headers: request?.request_headers ?? message?.request_headers ?? null,
                request_params: (request?.request_params ??
                    message?.request_params),
                caller_attribution: request?.caller_attribution ?? message?.caller_attribution ?? null,
                header_tier_id: message?.header_tier_id ?? null,
                header_tier_name: message?.header_tier_name ?? null,
                header_tier_color: message?.header_tier_color ?? null,
                autofix_applied: attempts.some((attempt) => attempt.autofix_applied) ||
                    (message?.autofix_applied ?? false),
                autofix_role: message?.autofix_role ?? null,
                autofix_operations: message?.autofix_operations ?? null,
                autofix_decision: message?.autofix_decision ?? null,
                autofix_sibling,
                ...(request
                    ? {
                        attempts: attempts.map((attempt) => ({
                            id: attempt.id,
                            model: attempt.model,
                            provider: attempt.provider,
                            status: attempt.status,
                            auth_type: attempt.auth_type,
                            error_message: attempt.error_message,
                            error_origin: attempt.error_origin,
                            error_class: attempt.error_class,
                            error_http_status: attempt.error_http_status,
                            duration_ms: attempt.duration_ms,
                            cost_usd: attempt.cost_usd,
                            input_tokens: attempt.input_tokens,
                            output_tokens: attempt.output_tokens,
                            fallback_from_model: attempt.fallback_from_model,
                            fallback_index: attempt.fallback_index,
                            request_headers: attempt.request_headers,
                            request_params: attempt.request_params,
                            autofix_applied: attempt.autofix_applied,
                            autofix_role: attempt.autofix_role,
                            autofix_operations: attempt.autofix_operations,
                            autofix_decision: attempt.autofix_decision,
                            recording: recordingsByAttempt.get(attempt.id) ?? null,
                        })),
                    }
                    : {}),
            },
        };
        return response;
    }
    async loadAttemptRecordings(attempts) {
        const result = new Map();
        if (!this.recordingStorage || attempts.length === 0)
            return result;
        await Promise.all(attempts.map(async (attempt) => {
            if (!attempt.recording_key)
                return;
            const payload = await this.loadRecording(attempt.id, attempt.recording_key);
            if (!payload)
                return;
            result.set(attempt.id, {
                request_body: payload.request_body,
                response_body: payload.response_body,
                wire_format: payload.wire_format,
            });
        }));
        return result;
    }
    async loadRecording(attemptId, storageKey) {
        if (!this.recordingStorage)
            return null;
        try {
            return await (0, request_recording_codec_1.decodeRequestRecording)(await this.recordingStorage.get(storageKey));
        }
        catch (error) {
            this.logger.warn(`Failed to load Provider Attempt recording ${attemptId}: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    async findAutofixSibling(id, groupId, tenantId) {
        const sibling = await this.messageRepo
            .createQueryBuilder('m')
            .where('m.autofix_group_id = :groupId', { groupId })
            .andWhere('m.tenant_id = :tenantId', { tenantId })
            .andWhere('m.id != :id', { id })
            .orderBy('m.timestamp', 'DESC')
            .getOne();
        if (!sibling)
            return null;
        return { id: sibling.id, role: sibling.autofix_role, status: sibling.status };
    }
};
exports.MessageDetailsService = MessageDetailsService;
exports.MessageDetailsService = MessageDetailsService = MessageDetailsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, typeorm_1.InjectRepository)(request_entity_1.ManifestRequest)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        request_recording_storage_service_1.RequestRecordingStorageService])
], MessageDetailsService);
//# sourceMappingURL=message-details.service.js.map