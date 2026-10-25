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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_query_dto_1 = require("../dto/messages-query.dto");
const message_feedback_dto_1 = require("../dto/message-feedback.dto");
const messages_query_service_1 = require("../services/messages-query.service");
const message_details_service_1 = require("../services/message-details.service");
const message_feedback_service_1 = require("../services/message-feedback.service");
const specificity_feedback_service_1 = require("../services/specificity-feedback.service");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
function splitCsv(value, max = 50) {
    if (!value)
        return undefined;
    return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, max);
}
let MessagesController = class MessagesController {
    messagesQuery;
    messageDetails;
    messageFeedback;
    specificityFeedback;
    constructor(messagesQuery, messageDetails, messageFeedback, specificityFeedback) {
        this.messagesQuery = messagesQuery;
        this.messageDetails = messageDetails;
        this.messageFeedback = messageFeedback;
        this.specificityFeedback = specificityFeedback;
    }
    async getMessages(query, ctx) {
        return this.messagesQuery.getMessages({
            range: query.range,
            tenantId: ctx.tenantId,
            provider: query.provider,
            connections: splitCsv(query.connections),
            models: splitCsv(query.model),
            service_type: query.service_type,
            cost_min: query.cost_min,
            cost_max: query.cost_max,
            limit: Math.min(query.limit ?? 50, 200),
            cursor: query.cursor,
            agent_name: query.agent_name,
            status: query.status,
            attemptStatus: query.attempts
                ? [...new Set(query.attempts.split(','))]
                : undefined,
            triggers: query.trigger
                ? [...new Set(query.trigger.split(','))]
                : undefined,
            origin: query.origin,
            error_class: query.error_class,
            routing_tier: query.routing_tier,
            specificity_category: query.specificity_category,
            header_tier_id: query.header_tier_id,
            include_total: query.include_total,
            cache_total: query.cache_total,
            include_filter_options: query.include_filter_options,
        });
    }
    async getMessageFilterOptions(query, ctx) {
        return this.messagesQuery.getMessageFilterOptions({
            range: query.range,
            tenantId: ctx.tenantId,
            agent_name: query.agent_name,
        });
    }
    async getMessageDetails(id, ctx) {
        return this.messageDetails.getDetails(id, ctx.tenantId);
    }
    async setFeedback(id, body, ctx) {
        await this.messageFeedback.setFeedback(id, ctx.tenantId, body.rating, body.tags, body.details);
    }
    async clearFeedback(id, ctx) {
        await this.messageFeedback.clearFeedback(id, ctx.tenantId);
    }
    async flagMiscategorized(id, ctx) {
        await this.specificityFeedback.flagMiscategorized(id, ctx.tenantId);
    }
    async clearMiscategorized(id, ctx) {
        await this.specificityFeedback.clearFlag(id, ctx.tenantId);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [messages_query_dto_1.MessagesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)('messages/filter-options'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [messages_query_dto_1.MessagesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessageFilterOptions", null);
__decorate([
    (0, common_1.Get)('messages/:id/details'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessageDetails", null);
__decorate([
    (0, common_1.Patch)('messages/:id/feedback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_feedback_dto_1.MessageFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "setFeedback", null);
__decorate([
    (0, common_1.Delete)('messages/:id/feedback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "clearFeedback", null);
__decorate([
    (0, common_1.Patch)('messages/:id/miscategorized'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "flagMiscategorized", null);
__decorate([
    (0, common_1.Delete)('messages/:id/miscategorized'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "clearMiscategorized", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [messages_query_service_1.MessagesQueryService,
        message_details_service_1.MessageDetailsService,
        message_feedback_service_1.MessageFeedbackService,
        specificity_feedback_service_1.SpecificityFeedbackService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map