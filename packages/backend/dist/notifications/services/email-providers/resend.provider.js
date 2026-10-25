"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendProvider = void 0;
const logger = {
    warn: (msg) => console.warn(`[Resend] ${msg}`),
    error: (msg) => console.error(`[Resend] ${msg}`),
    log: (msg) => console.log(`[Resend] ${msg}`),
};
class ResendProvider {
    name = 'resend';
    apiKey;
    defaultFrom;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.defaultFrom = config.fromEmail ?? 'noreply@manifest.build';
    }
    async send(opts) {
        if (!this.apiKey) {
            logger.warn('Resend not configured — skipping email send');
            return false;
        }
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: opts.from ?? `Manifest <${this.defaultFrom}>`,
                    to: [opts.to],
                    subject: opts.subject,
                    html: opts.html,
                    ...(opts.text ? { text: opts.text } : {}),
                }),
            });
            if (!res.ok) {
                logger.error(`Resend returned ${res.status}: ${await res.text()}`);
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
exports.ResendProvider = ResendProvider;
//# sourceMappingURL=resend.provider.js.map