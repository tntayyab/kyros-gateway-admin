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
var SpecificityFeedbackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificityFeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const manifest_shared_1 = require("manifest-shared");
let SpecificityFeedbackService = class SpecificityFeedbackService {
    static { SpecificityFeedbackService_1 = this; }
    messageRepo;
    logger = new common_1.Logger(SpecificityFeedbackService_1.name);
    static PENALTY_PER_FLAG = 0.75;
    static PENALTY_CAP = 3;
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    async flagMiscategorized(messageId, tenantId) {
        const message = await this.findOwnedMessage(messageId, tenantId);
        if (!message.specificity_category) {
            throw new common_1.NotFoundException('Message was not routed by specificity');
        }
        await this.messageRepo.update(message.id, { specificity_miscategorized: true });
    }
    async clearFlag(messageId, tenantId) {
        const message = await this.findOwnedMessage(messageId, tenantId);
        await this.messageRepo.update(message.id, { specificity_miscategorized: false });
    }
    async getPenaltiesForAgent(tenantId, agentId) {
        const penalties = new Map();
        if (!agentId)
            return penalties;
        const qb = this.messageRepo
            .createQueryBuilder('m')
            .select('m.specificity_category', 'category')
            .addSelect('COUNT(*)::int', 'count')
            .where('m.specificity_miscategorized = true')
            .andWhere('m.specificity_category IS NOT NULL')
            .andWhere('m.agent_id = :agentId', { agentId })
            .groupBy('m.specificity_category');
        if (tenantId)
            qb.andWhere('m.tenant_id = :tenantId', { tenantId });
        const rows = await qb.getRawMany();
        for (const row of rows) {
            if (!manifest_shared_1.SPECIFICITY_CATEGORIES.includes(row.category))
                continue;
            const penalty = Math.min(row.count * SpecificityFeedbackService_1.PENALTY_PER_FLAG, SpecificityFeedbackService_1.PENALTY_CAP);
            if (penalty > 0) {
                penalties.set(row.category, penalty);
            }
        }
        return penalties;
    }
    async findOwnedMessage(messageId, tenantId) {
        if (!tenantId)
            throw new common_1.NotFoundException('Message not found');
        const message = await this.messageRepo
            .createQueryBuilder('m')
            .where('m.id = :id', { id: messageId })
            .andWhere('m.tenant_id = :tenantId', { tenantId })
            .getOne();
        if (message)
            return message;
        const requestQb = this.messageRepo.createQueryBuilder('m');
        if (!requestQb)
            throw new common_1.NotFoundException('Message not found');
        const requestAttempt = await requestQb
            .where('m.request_id = :requestId', { requestId: messageId })
            .andWhere('m.tenant_id = :tenantId', { tenantId })
            .andWhere('m.specificity_category IS NOT NULL')
            .getOne();
        if (!requestAttempt)
            throw new common_1.NotFoundException('Message not found');
        return requestAttempt;
    }
};
exports.SpecificityFeedbackService = SpecificityFeedbackService;
exports.SpecificityFeedbackService = SpecificityFeedbackService = SpecificityFeedbackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SpecificityFeedbackService);
//# sourceMappingURL=specificity-feedback.service.js.map