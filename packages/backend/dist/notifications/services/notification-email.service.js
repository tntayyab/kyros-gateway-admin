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
var NotificationEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const render_1 = require("@react-email/render");
const threshold_alert_1 = require("../emails/threshold-alert");
const send_email_1 = require("./email-providers/send-email");
const resolve_provider_1 = require("./email-providers/resolve-provider");
let NotificationEmailService = NotificationEmailService_1 = class NotificationEmailService {
    configService;
    logger = new common_1.Logger(NotificationEmailService_1.name);
    fromEmail;
    constructor(configService) {
        this.configService = configService;
        this.fromEmail =
            this.configService.get('app.emailFrom') ||
                this.configService.get('app.notificationFromEmail', 'noreply@manifest.build');
    }
    async sendThresholdAlert(to, props, providerConfig) {
        const element = (0, threshold_alert_1.ThresholdAlertEmail)(props);
        const html = await (0, render_1.render)(element);
        const text = await (0, render_1.render)(element, { plainText: true });
        const subject = props.alertType === 'soft'
            ? `Warning: ${props.agentName} exceeded ${props.metricType} threshold`
            : `Blocked: ${props.agentName} reached ${props.metricType} limit`;
        if (providerConfig) {
            const defaultFrom = this.fromEmail;
            const from = providerConfig.domain
                ? `Manifest <noreply@${providerConfig.domain}>`
                : `Manifest <${defaultFrom}>`;
            const config = {
                provider: providerConfig.provider,
                apiKey: providerConfig.apiKey,
                domain: providerConfig.domain ?? undefined,
            };
            const provider = (0, resolve_provider_1.createProvider)(config);
            const sent = await provider.send({ to, subject, html, text, from });
            if (sent) {
                this.logger.log(`Threshold alert sent to ${to} for agent ${props.agentName}`);
            }
            return sent;
        }
        const from = `Manifest <${this.fromEmail}>`;
        const sent = await (0, send_email_1.sendEmail)({ to, subject, html, text, from });
        if (sent) {
            this.logger.log(`Threshold alert sent to ${to} for agent ${props.agentName}`);
        }
        return sent;
    }
};
exports.NotificationEmailService = NotificationEmailService;
exports.NotificationEmailService = NotificationEmailService = NotificationEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationEmailService);
//# sourceMappingURL=notification-email.service.js.map