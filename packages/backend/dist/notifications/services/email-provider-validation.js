"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_RE = void 0;
exports.validateProviderConfig = validateProviderConfig;
exports.DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
function validateProviderConfig(provider, apiKey, domain) {
    const errors = [];
    const trimmedKey = apiKey.trim();
    const trimmedDomain = (domain ?? '').trim().toLowerCase();
    if (provider === 'resend') {
        if (!trimmedKey.startsWith('re_')) {
            errors.push('Resend API key must start with re_');
        }
    }
    if (provider === 'sendgrid') {
        if (!trimmedKey.startsWith('SG.')) {
            errors.push('SendGrid API key must start with SG.');
        }
    }
    if (trimmedKey.length < 8) {
        errors.push('API key must be at least 8 characters');
    }
    if (provider === 'mailgun') {
        if (!trimmedDomain) {
            errors.push('Domain is required for Mailgun');
        }
        else if (trimmedDomain.length > 253) {
            errors.push('Domain name exceeds maximum length');
        }
        else if (!exports.DOMAIN_RE.test(trimmedDomain)) {
            errors.push('Invalid domain format');
        }
    }
    else if (trimmedDomain) {
        if (trimmedDomain.length > 253) {
            errors.push('Domain name exceeds maximum length');
        }
        else if (!exports.DOMAIN_RE.test(trimmedDomain)) {
            errors.push('Invalid domain format');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        normalized: { provider, apiKey: trimmedKey, domain: trimmedDomain },
    };
}
//# sourceMappingURL=email-provider-validation.js.map