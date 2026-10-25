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
var BillingEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingEmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const billing_email_sender_1 = require("./billing-email-sender");
let BillingEmailService = BillingEmailService_1 = class BillingEmailService {
    configService;
    logger = new common_1.Logger(BillingEmailService_1.name);
    fromEmail;
    constructor(configService) {
        this.configService = configService;
        this.fromEmail =
            this.configService.get('app.emailFrom') ||
                this.configService.get('app.notificationFromEmail', 'noreply@manifest.build');
    }
    getAppUrl() {
        return (0, billing_email_sender_1.getBillingAppUrl)(this.configService.get('app.betterAuthUrl', ''));
    }
    async sendSubscriptionPlanEmail(to, props) {
        const appUrl = this.getAppUrl();
        const sent = await (0, billing_email_sender_1.sendSubscriptionPlanEmail)(to, {
            ...props,
            appUrl,
            manageBillingUrl: `${appUrl}/account`,
        }, this.fromEmail);
        if (!sent)
            this.logger.warn(`Failed to send billing lifecycle email to ${to}`);
        return sent;
    }
    async sendPlanUsageEmail(to, props) {
        const sent = await (0, billing_email_sender_1.sendPlanUsageEmail)(to, {
            ...props,
            appUrl: this.getAppUrl(),
        }, this.fromEmail);
        if (!sent)
            this.logger.warn(`Failed to send billing usage email to ${to}`);
        return sent;
    }
};
exports.BillingEmailService = BillingEmailService;
exports.BillingEmailService = BillingEmailService = BillingEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BillingEmailService);
//# sourceMappingURL=billing-email.service.js.map