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
var NotificationCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const notification_rules_service_1 = require("./notification-rules.service");
const notification_email_service_1 = require("./notification-email.service");
const email_provider_config_service_1 = require("./email-provider-config.service");
const notification_log_service_1 = require("./notification-log.service");
const manifest_runtime_service_1 = require("../../common/services/manifest-runtime.service");
const period_util_1 = require("../../common/utils/period.util");
let NotificationCronService = NotificationCronService_1 = class NotificationCronService {
    rulesService;
    emailService;
    emailProviderConfigService;
    runtime;
    notificationLog;
    logger = new common_1.Logger(NotificationCronService_1.name);
    constructor(rulesService, emailService, emailProviderConfigService, runtime, notificationLog) {
        this.rulesService = rulesService;
        this.emailService = emailService;
        this.emailProviderConfigService = emailProviderConfigService;
        this.runtime = runtime;
        this.notificationLog = notificationLog;
    }
    async onModuleInit() {
        try {
            const triggered = await this.checkThresholds();
            if (triggered > 0) {
                this.logger.log(`Startup catch-up: ${triggered} notification(s) triggered`);
            }
        }
        catch (err) {
            this.logger.error(`Startup catch-up failed: ${err}`);
        }
    }
    async checkThresholds(tenantId) {
        const rules = tenantId
            ? await this.rulesService.getActiveRulesForTenant(tenantId)
            : await this.rulesService.getAllActiveRules();
        if (!rules.length)
            return 0;
        this.logger.log(`Checking ${rules.length} notification rules...`);
        const groups = new Map();
        for (const rule of rules) {
            const key = `${rule.tenant_id}|${rule.agent_name}|${rule.period}`;
            if (!groups.has(key))
                groups.set(key, { rules: [], consumption: new Map() });
            groups.get(key).rules.push(rule);
        }
        for (const [, group] of groups) {
            const sample = group.rules[0];
            const { periodStart, periodEnd } = (0, period_util_1.computePeriodBoundaries)(sample.period);
            const metrics = new Set(group.rules.map((r) => r.metric_type));
            for (const metric of metrics) {
                try {
                    const value = await this.rulesService.getConsumption(sample.tenant_id, sample.agent_name, metric, periodStart, periodEnd);
                    group.consumption.set(metric, value);
                }
                catch (err) {
                    this.logger.error(`Error fetching consumption for ${sample.agent_name}/${metric}: ${err}`);
                }
            }
        }
        let triggered = 0;
        for (const [, group] of groups) {
            for (const rule of group.rules) {
                try {
                    const actual = group.consumption.get(rule.metric_type);
                    if (actual === undefined)
                        continue;
                    const sent = await this.evaluateRule(rule, actual);
                    if (sent)
                        triggered++;
                }
                catch (err) {
                    this.logger.error(`Error evaluating rule ${rule.id}: ${err}`);
                }
            }
        }
        if (triggered > 0) {
            this.logger.log(`${triggered} notification(s) triggered`);
        }
        return triggered;
    }
    async evaluateRule(rule, actual) {
        const { periodStart, periodEnd } = (0, period_util_1.computePeriodBoundaries)(rule.period);
        if (await this.notificationLog.hasAlreadySent(rule.id, periodStart))
            return false;
        if (actual < rule.threshold)
            return false;
        const now = (0, notification_log_service_1.formatNotificationTimestamp)();
        const fullConfig = await this.emailProviderConfigService.getFullConfig(rule.tenant_id);
        const email = await this.notificationLog.resolveRecipientEmail(rule.tenant_id, fullConfig?.notificationEmail);
        await this.notificationLog.insertLog({
            ruleId: rule.id,
            periodStart,
            periodEnd,
            actualValue: actual,
            thresholdValue: rule.threshold,
            metricType: rule.metric_type,
            agentName: rule.agent_name,
            sentAt: now,
        });
        if (email) {
            const emailSent = await this.emailService.sendThresholdAlert(email, {
                agentName: rule.agent_name,
                metricType: rule.metric_type,
                threshold: rule.threshold,
                actualValue: actual,
                period: rule.period,
                timestamp: now,
                agentUrl: `${this.runtime.getAuthBaseUrl()}/agents/${encodeURIComponent(rule.agent_name)}`,
                alertType: 'soft',
            }, fullConfig ?? undefined);
            if (!emailSent) {
                this.logger.warn(`Failed to send alert for rule ${rule.id}, will retry next cron run`);
            }
        }
        else {
            this.logger.warn(`No email found for tenant ${rule.tenant_id}, skipping alert for rule ${rule.id}`);
        }
        return true;
    }
};
exports.NotificationCronService = NotificationCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "checkThresholds", null);
exports.NotificationCronService = NotificationCronService = NotificationCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_rules_service_1.NotificationRulesService,
        notification_email_service_1.NotificationEmailService,
        email_provider_config_service_1.EmailProviderConfigService,
        manifest_runtime_service_1.ManifestRuntimeService,
        notification_log_service_1.NotificationLogService])
], NotificationCronService);
//# sourceMappingURL=notification-cron.service.js.map