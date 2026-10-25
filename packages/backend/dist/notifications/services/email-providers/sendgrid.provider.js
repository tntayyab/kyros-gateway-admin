"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridProvider = void 0;
const logger = {
    warn: (msg) => console.warn(`[SendGrid] ${msg}`),
    error: (msg) => console.error(`[SendGrid] ${msg}`),
    log: (msg) => console.log(`[SendGrid] ${msg}`),
};
class SendGridProvider {
    name = 'sendgrid';
    apiKey;
    defaultFrom;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.defaultFrom = config.fromEmail ?? 'noreply@manifest.build';
    }
    async send(opts) {
        if (!this.apiKey) {
            logger.warn('SendGrid not configured — skipping email send');
            return false;
        }
        try {
            const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: opts.to }] }],
                    from: { email: this.parseFromEmail(opts.from) },
                    subject: opts.subject,
                    content: [
                        ...(opts.text ? [{ type: 'text/plain', value: opts.text }] : []),
                        { type: 'text/html', value: opts.html },
                    ],
                }),
            });
            if (!res.ok) {
                logger.error(`SendGrid returned ${res.status}: ${await res.text()}`);
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
    parseFromEmail(from) {
        if (!from)
            return this.defaultFrom;
        const match = from.match(/<(.+)>/);
        return match ? match[1] : from;
    }
}
exports.SendGridProvider = SendGridProvider;
//# sourceMappingURL=sendgrid.provider.js.map