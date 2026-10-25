"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrubSecrets = scrubSecrets;
const PATTERNS = [
    {
        re: /(["']?)(x-api-key|authorization|api-key)\1(\s*[:=]\s*)(["']?)[^"',}\r\n]+\4/gi,
        replacement: '$1$2$1$3$4[REDACTED]$4',
    },
    {
        re: /(["']?)(refresh_token|client_secret|access_token|device_code)\1(\s*[:=]\s*)(["']?)[^"',}&\s]+\4/gi,
        replacement: '$1$2$1$3$4[REDACTED]$4',
    },
    { re: /Bearer\s+[A-Za-z0-9_\-.=+/]{8,}/gi, replacement: 'Bearer [REDACTED]' },
    { re: /([?&])key=[^&\s"']+/g, replacement: '$1key=[REDACTED]' },
    { re: /\bsk-ant-[A-Za-z0-9_\-]{10,}/g, replacement: '[REDACTED]' },
    { re: /\bsk-proj-[A-Za-z0-9_\-]{10,}/g, replacement: '[REDACTED]' },
    { re: /\bsk-[A-Za-z0-9_\-]{10,}/g, replacement: '[REDACTED]' },
    { re: /\bgsk_[A-Za-z0-9_\-]{10,}/g, replacement: '[REDACTED]' },
    { re: /\bxai-[A-Za-z0-9_\-]{10,}/g, replacement: '[REDACTED]' },
    { re: /\bmnfst_[A-Za-z0-9_\-]{10,}/g, replacement: '[REDACTED]' },
    { re: /\bAIza[A-Za-z0-9_\-]{10,}/g, replacement: '[REDACTED]' },
];
function scrubSecrets(text) {
    if (text == null)
        return '';
    let out = text;
    for (const { re, replacement } of PATTERNS) {
        out = out.replace(re, replacement);
    }
    return out;
}
//# sourceMappingURL=secret-scrub.js.map