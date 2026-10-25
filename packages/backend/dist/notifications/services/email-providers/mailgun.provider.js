"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailgunProvider = void 0;
const email_provider_validation_1 = require("../email-provider-validation");
const MAILGUN_BASE = 'https://api.mailgun.net';
const logger = {
    warn: (msg) => console.warn(`[Mailgun] ${msg}`),
    error: (msg) => console.error(`[Mailgun] ${msg}`),
    log: (msg) => console.log(`[Mailgun] ${msg}`),
};
class MailgunProvider {
    name = 'mailgun';
    apiKey;
    domain;
    defaultFrom;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.domain = config.domain ?? '';
        this.defaultFrom = config.fromEmail ?? 'noreply@manifest.build';
    }
    async send(opts) {
        if (!this.apiKey || !this.domain) {
            logger.warn('Mailgun not configured — skipping email send');
            return false;
        }
        if (!email_provider_validation_1.DOMAIN_RE.test(this.domain)) {
            logger.error('Invalid Mailgun domain — must be a valid hostname');
            return false;
        }
        try {
            const form = new URLSearchParams();
            form.append('from', opts.from ?? `Manifest <${this.defaultFrom}>`);
            form.append('to', opts.to);
            form.append('subject', opts.subject);
            form.append('html', opts.html);
            if (opts.text)
                form.append('text', opts.text);
            form.append('h:Reply-To', this.defaultFrom);
            form.append('o:tag', 'manifest');
            const url = new URL(`/v3/${encodeURIComponent(this.domain)}/messages`, MAILGUN_BASE);
            const res = await fetch(url.href, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
                },
                body: form,
            });
            if (!res.ok) {
                logger.error(`Mailgun returned ${res.status}: ${await res.text()}`);
                return false;
            }
            logger.log(`Email sent to ${opts.to}: ${opts.subject}`);
            return true;
        }
        catch (err) {
            logger.error(`Failed to send email: ${err}`);
            return false;
        }
    }
}
exports.MailgunProvider = MailgunProvider;
//# sourceMappingURL=mailgun.provider.js.map