"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildForwardBody = buildForwardBody;
exports.derivePromptForHistory = derivePromptForHistory;
function buildForwardBody(dto) {
    if (dto.rawRequestBody)
        return dto.rawRequestBody;
    return { messages: dto.messages ?? [] };
}
function derivePromptForHistory(dto) {
    if (dto.messages && dto.messages.length > 0) {
        const fromMessages = lastUserContent(dto.messages);
        if (fromMessages)
            return fromMessages;
    }
    if (dto.rawRequestBody) {
        return derivePromptFromRawBody(dto.rawRequestBody);
    }
    return '';
}
function lastUserContent(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (m.role === 'user' && typeof m.content === 'string' && m.content.length > 0) {
            return m.content;
        }
    }
    return '';
}
function derivePromptFromRawBody(body) {
    const messages = body['messages'];
    if (Array.isArray(messages)) {
        for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (!m || m.role !== 'user')
                continue;
            if (typeof m.content === 'string') {
                if (m.content.length > 0)
                    return m.content;
                continue;
            }
            if (Array.isArray(m.content)) {
                const text = m.content
                    .map((p) => p &&
                    typeof p === 'object' &&
                    'text' in p &&
                    typeof p.text === 'string'
                    ? p.text
                    : '')
                    .join('');
                if (text)
                    return text;
            }
        }
    }
    const input = body['input'];
    if (typeof input === 'string')
        return input;
    if (Array.isArray(input)) {
        for (let i = input.length - 1; i >= 0; i--) {
            const item = input[i];
            if (item &&
                item.role === 'user' &&
                typeof item.content === 'string' &&
                item.content.length > 0) {
                return item.content;
            }
        }
    }
    return '';
}
//# sourceMappingURL=playground-payload.js.map