"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProvider = createProvider;
const mailgun_provider_1 = require("./mailgun.provider");
const sendgrid_provider_1 = require("./sendgrid.provider");
const resend_provider_1 = require("./resend.provider");
function createProvider(config) {
    switch (config.provider) {
        case 'mailgun':
            return new mailgun_provider_1.MailgunProvider(config);
        case 'sendgrid':
            return new sendgrid_provider_1.SendGridProvider(config);
        case 'resend':
            return new resend_provider_1.ResendProvider(config);
        default:
            throw new Error(`Unknown email provider: ${config.provider}`);
    }
}
//# sourceMappingURL=resolve-provider.js.map