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
var LimitCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitCheckService = void 0;
const common_1 = require("@nestjs/common");
const notification_rules_service_1 = require("./notification-rules.service");
const notification_email_service_1 = require("./notification-email.service");
const email_provider_config_service_1 = require("./email-provider-config.service");
const notification_log_service_1 = require("./notification-log.service");
const manifest_runtime_service_1 = require("../../common/services/manifest-runtime.service");
const period_util_1 = require("../../common/utils/period.util");
let LimitCheckService = LimitCheckService_1 = class LimitCheckService {
    rulesService;
    emailService;
    emailProviderConfig;
    runtime;
    notificationLog;
    logger = new common_1.Logger(LimitCheckService_1.name);
    constructor(rulesService, emailService, emailProviderConfig, runtime, notificationLog) {
        this.rulesService = rulesService;
        this.emailService = emailService;
        this.emailProviderConfig = emailProviderConfig;
        this.runtime = runtime;
        this.notificationLog = notificationLog;
    }
    async checkLimits(tenantId, agentName) {
        const rules = await this.rulesService.getActiveBlockRules(tenantId, agentName);
        if (rules.length === 0)
            return null;
        const consumptionByMetricAndPeriod = new Map();
        for (const rule of rules) {
            const { periodStart, periodEnd } = (0, period_util_1.computePeriodBoundaries)(rule.period);
            const consumptionKey = `${rule.metric_type}:${periodStart}:${periodEnd}`;
            let actual = consumptionByMetricAndPeriod.get(consumptionKey);
            if (actual === undefined) {
                actual = await this.rulesService.getConsumption(tenantId, agentName, rule.metric_type, periodStart, periodEnd);
                consumptionByMetricAndPeriod.set(consumptionKey, actual);
            }
            if (actual >= rule.threshold) {
                this.notifyLimitExceeded(rule, actual, periodStart, periodEnd).catch((err) => {
                    this.logger.error(`Failed to send block notification for rule ${rule.id}: ${err}`);
                });
                return {
                    ruleId: rule.id,
                    metricType: rule.metric_type,
                    threshold: rule.threshold,
                    actual,
                    period: rule.period,
                };
            }
        }
        return null;
    }
    async notifyLimitExceeded(rule, actual, periodStart, periodEnd) {
        if (await this.notificationLog.hasAlreadySent(rule.id, periodStart))
            return;
        const now = (0, notification_log_service_1.formatNotificationTimestamp)();
        const providerConfig = await this.emailProviderConfig.getFullConfig(rule.tenant_id);
        const email = await this.notificationLog.resolveRecipientEmail(rule.tenant_id, providerConfig?.notificationEmail);
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
            await this.emailService.sendThresholdAlert(email, {
                agentName: rule.agent_name,
                metricType: rule.metric_type,
                threshold: rule.threshold,
                actualValue: actual,
                period: rule.period,
                timestamp: now,
                agentUrl: `${this.runtime.getAuthBaseUrl()}/agents/${encodeURIComponent(rule.agent_name)}`,
                alertType: 'hard',
                periodResetDate: (0, period_util_1.computePeriodResetDate)(rule.period),
            }, providerConfig ?? undefined);
        }
    }
};
exports.LimitCheckService = LimitCheckService;
exports.LimitCheckService = LimitCheckService = LimitCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_rules_service_1.NotificationRulesService,
        notification_email_service_1.NotificationEmailService,
        email_provider_config_service_1.EmailProviderConfigService,
        manifest_runtime_service_1.ManifestRuntimeService,
        notification_log_service_1.NotificationLogService])
], LimitCheckService);
//# sourceMappingURL=limit-check.service.js.map