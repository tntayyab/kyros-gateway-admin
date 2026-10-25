"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapCodeAssistResponse = unwrapCodeAssistResponse;
exports.unwrapCodeAssistStreamPayload = unwrapCodeAssistStreamPayload;
exports.unwrapCodeAssistStreamChunk = unwrapCodeAssistStreamChunk;
function unwrapCodeAssistResponse(body) {
    const inner = body.response;
    return inner && typeof inner === 'object' ? inner : body;
}
function unwrapCodeAssistStreamPayload(payload) {
    if (!payload || payload === '[DONE]')
        return payload;
    try {
        const parsed = JSON.parse(payload);
        const inner = parsed.response;
        if (inner && typeof inner === 'object') {
            return JSON.stringify(inner);
        }
        return payload;
    }
    catch {
        return payload;
    }
}
function unwrapCodeAssistStreamChunk(chunk) {
    const lines = chunk.split('\n');
    if (!lines.some((line) => line.startsWith('data:'))) {
        return unwrapCodeAssistStreamPayload(chunk);
    }
    return lines
        .map((line) => {
        if (!line.startsWith('data:'))
            return line;
        const payload = line.slice('data:'.length).trimStart();
        const unwrapped = unwrapCodeAssistStreamPayload(payload);
        return unwrapped === payload ? line : `data: ${unwrapped}`;
    })
        .join('\n');
}
//# sourceMappingURL=codeassist-envelope.js.map