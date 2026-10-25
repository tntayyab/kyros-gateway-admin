"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peelEnvelope = peelEnvelope;
const ENVELOPE_HEADER_REGEX = /^\s*[^\n]{0,120}?(?:metadata|sender|envelope|context|system message)[^\n]{0,80}:\s*\n/i;
const FENCE_LANGUAGE_REGEX = /^```([a-z+_-]*)\n([\s\S]*?)\n```/;
const STRUCTURED_LANGUAGES = new Set(['json', 'jsonl', 'yaml', 'yml', 'toml', 'xml']);
function peelEnvelope(text) {
    if (text.length === 0)
        return text;
    let working = text;
    const headerMatch = working.match(ENVELOPE_HEADER_REGEX);
    if (headerMatch) {
        working = working.slice(headerMatch[0].length);
    }
    const trimmed = working.replace(/^\s+/, '');
    const fenceMatch = trimmed.match(FENCE_LANGUAGE_REGEX);
    if (!fenceMatch) {
        return text;
    }
    const language = fenceMatch[1].toLowerCase();
    const inner = fenceMatch[2];
    const isStructured = STRUCTURED_LANGUAGES.has(language) || looksLikeStructuredData(inner);
    if (!isStructured) {
        return text;
    }
    const afterFence = trimmed.slice(fenceMatch[0].length);
    const trailing = afterFence.replace(/^\s+/, '');
    if (trailing.length === 0) {
        return text;
    }
    return trailing;
}
function looksLikeStructuredData(inner) {
    const stripped = inner.trim();
    if (stripped.length === 0)
        return false;
    const first = stripped[0];
    const last = stripped[stripped.length - 1];
    if ((first === '{' && last === '}') || (first === '[' && last === ']'))
        return true;
    const lines = stripped.split('\n');
    let yamlLines = 0;
    for (const line of lines) {
        const t = line.trim();
        if (t.length === 0)
            continue;
        if (/^[A-Za-z_][\w.-]*\s*:\s*\S/.test(t) || /^- /.test(t)) {
            yamlLines++;
        }
        else {
            return false;
        }
    }
    return yamlLines >= 2;
}
//# sourceMappingURL=envelope-peeler.js.map