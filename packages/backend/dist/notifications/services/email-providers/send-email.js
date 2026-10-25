"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmailConfigured = isEmailConfigured;
exports.sendEmail = sendEmail;
const resolve_provider_1 = require("./resolve-provider");
const logger = {
    warn: (msg) => console.warn(`[Email] ${msg}`),
};
function isValidProvider(p) {
    return p === 'mailgun' || p === 'resend' || p === 'sendgrid';
}
function resolveConfig(env) {
    const provider = env?.emailProvider ?? process.env['EMAIL_PROVIDER'];
    const apiKey = env?.emailApiKey ?? process.env['EMAIL_API_KEY'];
    if (provider && apiKey) {
        if (!isValidProvider(provider)) {
            logger.warn(`Unknown EMAIL_PROVIDER=${provider}. Expected: mailgun, resend, or sendgrid.`);
            return null;
        }
        const domain = env?.emailDomain ?? process.env['EMAIL_DOMAIN'];
        if (provider === 'mailgun' && !domain) {
            logger.warn('EMAIL_PROVIDER=mailgun requires EMAIL_DOMAIN. Skipping email send.');
            return null;
        }
        return {
            provider,
            apiKey,
            domain,
            fromEmail: env?.emailFrom ?? process.env['EMAIL_FROM'] ?? process.env['NOTIFICATION_FROM_EMAIL'],
        };
    }
    const mailgunApiKey = env?.mailgunApiKey ?? process.env['MAILGUN_API_KEY'] ?? '';
    const mailgunDomain = env?.mailgunDomain ?? process.env['MAILGUN_DOMAIN'] ?? '';
    if (mailgunApiKey && mailgunDomain) {
        return {
            provider: 'mailgun',
            apiKey: mailgunApiKey,
            domain: mailgunDomain,
            fromEmail: env?.notificationFromEmail ?? process.env['NOTIFICATION_FROM_EMAIL'],
        };
    }
    return null;
}
function isEmailConfigured(env) {
    return resolveConfig(env) !== null;
}
async function sendEmail(opts, env) {
    const config = resolveConfig(env);
    if (!config) {
        logger.warn('No email provider configured — skipping email send');
        return false;
    }
    const provider = (0, resolve_provider_1.createProvider)(config);
    return provider.send(opts);
}
//# sourceMappingURL=send-email.js.map