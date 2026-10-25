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
var NotificationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const notification_rules_service_1 = require("./services/notification-rules.service");
const notification_log_service_1 = require("./services/notification-log.service");
const email_provider_config_service_1 = require("./services/email-provider-config.service");
const notification_cron_service_1 = require("./services/notification-cron.service");
const notification_rule_dto_1 = require("./dto/notification-rule.dto");
const set_email_provider_dto_1 = require("./dto/set-email-provider.dto");
const set_notification_email_dto_1 = require("./dto/set-notification-email.dto");
let NotificationsController = NotificationsController_1 = class NotificationsController {
    rulesService;
    notificationLog;
    emailProviderConfigService;
    cronService;
    logger = new common_1.Logger(NotificationsController_1.name);
    constructor(rulesService, notificationLog, emailProviderConfigService, cronService) {
        this.rulesService = rulesService;
        this.notificationLog = notificationLog;
        this.emailProviderConfigService = emailProviderConfigService;
        this.cronService = cronService;
    }
    async getEmailProvider(ctx) {
        const config = await this.emailProviderConfigService.getConfig(ctx.tenantId);
        return config ?? { configured: false };
    }
    async testEmailProvider(_ctx, body) {
        return this.emailProviderConfigService.testConfig({ provider: body.provider, apiKey: body.apiKey, domain: body.domain }, body.to);
    }
    async testSavedEmailProvider(ctx, body) {
        return this.emailProviderConfigService.testSavedConfig(ctx.tenantId, body.to);
    }
    async setEmailProvider(ctx, body) {
        return this.emailProviderConfigService.upsert(ctx, body);
    }
    async removeEmailProvider(ctx) {
        await this.emailProviderConfigService.remove(ctx.tenantId);
        return { ok: true };
    }
    async getNotificationEmail(ctx) {
        const email = await this.emailProviderConfigService.getNotificationEmail(ctx.tenantId);
        return { email };
    }
    async setNotificationEmail(ctx, body) {
        await this.emailProviderConfigService.setNotificationEmail(ctx.tenantId, body.email);
        return { saved: true };
    }
    async triggerCheck(ctx) {
        this.logger.log('Manual notification check triggered');
        const triggered = await this.cronService.checkThresholds(ctx.tenantId ?? undefined);
        return { triggered, message: `${triggered} notification(s) triggered` };
    }
    async getLogs(agentName, ctx) {
        return this.notificationLog.getLogsForAgent(ctx.tenantId, agentName);
    }
    async listRules(agentName, ctx) {
        return this.rulesService.listRules(ctx.tenantId, agentName);
    }
    async createRule(dto, ctx) {
        return this.rulesService.createRule(ctx.tenantId, dto);
    }
    async updateRule(id, dto, ctx) {
        return this.rulesService.updateRule(ctx.tenantId, id, dto);
    }
    async deleteRule(id, ctx) {
        await this.rulesService.deleteRule(ctx.tenantId, id);
        return { deleted: true };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('email-provider'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getEmailProvider", null);
__decorate([
    (0, common_1.Post)('email-provider/test'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_email_provider_dto_1.TestEmailProviderDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "testEmailProvider", null);
__decorate([
    (0, common_1.Post)('email-provider/test-saved'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_email_provider_dto_1.TestSavedEmailProviderDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "testSavedEmailProvider", null);
__decorate([
    (0, common_1.Post)('email-provider'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_email_provider_dto_1.SetEmailProviderDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "setEmailProvider", null);
__decorate([
    (0, common_1.Delete)('email-provider'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "removeEmailProvider", null);
__decorate([
    (0, common_1.Get)('notification-email'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotificationEmail", null);
__decorate([
    (0, common_1.Post)('notification-email'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_notification_email_dto_1.SetNotificationEmailDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "setNotificationEmail", null);
__decorate([
    (0, common_1.Post)('trigger-check'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "triggerCheck", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('agent_name')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('agent_name')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "listRules", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_rule_dto_1.CreateNotificationRuleDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createRule", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, notification_rule_dto_1.UpdateNotificationRuleDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteRule", null);
exports.NotificationsController = NotificationsController = NotificationsController_1 = __decorate([
    (0, common_1.Controller)('api/v1/notifications'),
    __metadata("design:paramtypes", [notification_rules_service_1.NotificationRulesService,
        notification_log_service_1.NotificationLogService,
        email_provider_config_service_1.EmailProviderConfigService,
        notification_cron_service_1.NotificationCronService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map