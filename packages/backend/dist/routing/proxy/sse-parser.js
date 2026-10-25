"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSE_BUFFER_OVERFLOW_MESSAGE = exports.DEFAULT_MAX_SSE_BUFFER_SIZE = void 0;
exports.createSsePayloadParser = createSsePayloadParser;
exports.formatSseComment = formatSseComment;
const eventsource_parser_1 = require("eventsource-parser");
exports.DEFAULT_MAX_SSE_BUFFER_SIZE = 1_048_576;
exports.SSE_BUFFER_OVERFLOW_MESSAGE = 'SSE buffer overflow: provider sent data without event boundaries';
function toTransformerPayload(event) {
    if (!event.data || event.data === '[DONE]')
        return null;
    const lines = [];
    if (event.event)
        lines.push(`event: ${event.event}`);
    if (event.id)
        lines.push(`id: ${event.id}`);
    lines.push(event.data);
    return lines.join('\n');
}
function createPayloadCollector(events, onFatalError, options) {
    return (0, eventsource_parser_1.createParser)({
        maxBufferSize: options.maxBufferSize,
        onEvent(event) {
            options.onEvent?.(event);
            const payload = toTransformerPayload(event);
            if (payload)
                events.push(payload);
        },
        onComment: options.onComment,
        onError(error) {
            if (error.type === 'max-buffer-size-exceeded')
                onFatalError(error);
        },
    });
}
function createSsePayloadParser(options = {}) {
    const maxBufferSize = options.maxBufferSize ?? exports.DEFAULT_MAX_SSE_BUFFER_SIZE;
    const events = [];
    let fatalError = null;
    const parser = createPayloadCollector(events, (error) => {
        fatalError = error;
    }, { ...options, maxBufferSize });
    const drain = () => {
        if (fatalError)
            throw new Error(exports.SSE_BUFFER_OVERFLOW_MESSAGE);
        const drained = events.slice();
        events.length = 0;
        return drained;
    };
    const feed = (chunk) => {
        if (!chunk)
            return [];
        parser.feed(chunk);
        return drain();
    };
    const flush = () => {
        parser.feed('\n\n');
        return drain();
    };
    return { feed, flush };
}
function formatSseComment(comment) {
    return comment ? `: ${comment}\n\n` : ':\n\n';
}
//# sourceMappingURL=sse-parser.js.map