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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const request_entity_1 = require("../../entities/request.entity");
let MessageFeedbackService = class MessageFeedbackService {
    messageRepo;
    requestRepo;
    constructor(messageRepo, requestRepo) {
        this.messageRepo = messageRepo;
        this.requestRepo = requestRepo;
    }
    async setFeedback(messageId, tenantId, rating, tags, details) {
        const target = await this.findFeedbackTarget(messageId, tenantId);
        const feedback = {
            feedback_rating: rating,
            feedback_tags: tags?.length ? tags.join(',') : null,
            feedback_details: details ?? null,
        };
        if (target.request) {
            await this.requestRepo.update(target.request.id, feedback);
        }
        else {
            await this.messageRepo.update(target.message.id, feedback);
        }
    }
    async clearFeedback(messageId, tenantId) {
        const target = await this.findFeedbackTarget(messageId, tenantId);
        const feedback = {
            feedback_rating: null,
            feedback_tags: null,
            feedback_details: null,
        };
        if (target.request) {
            await this.requestRepo.update(target.request.id, feedback);
        }
        else {
            await this.messageRepo.update(target.message.id, feedback);
        }
    }
    async findFeedbackTarget(messageId, tenantId) {
        if (!tenantId)
            throw new common_1.NotFoundException('Message not found');
        if (this.requestRepo) {
            const request = await this.findOwnedRequest(messageId, tenantId);
            if (request)
                return { request, message: null };
        }
        const message = await this.findOwnedMessage(messageId, tenantId);
        if (this.requestRepo && message.request_id) {
            const request = await this.findOwnedRequest(message.request_id, tenantId);
            if (!request)
                throw new common_1.NotFoundException('Message not found');
            return { request, message: null };
        }
        return { request: null, message };
    }
    async findOwnedRequest(requestId, tenantId) {
        if (!tenantId)
            return null;
        return this.requestRepo.findOne({
            where: { id: requestId, tenant_id: tenantId },
        });
    }
    async findOwnedMessage(messageId, tenantId) {
        if (!tenantId)
            throw new common_1.NotFoundException('Message not found');
        const qb = this.messageRepo
            .createQueryBuilder('m')
            .where('m.id = :id', { id: messageId })
            .andWhere('m.tenant_id = :tenantId', { tenantId });
        const message = await qb.getOne();
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        return message;
    }
};
exports.MessageFeedbackService = MessageFeedbackService;
exports.MessageFeedbackService = MessageFeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, typeorm_1.InjectRepository)(request_entity_1.ManifestRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessageFeedbackService);
//# sourceMappingURL=message-feedback.service.js.map