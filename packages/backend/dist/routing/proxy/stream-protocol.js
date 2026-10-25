"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamProtocolObserver = exports.StreamIdleTimeoutError = exports.UpstreamStreamError = exports.INCOMPLETE_STREAM_MESSAGE = exports.STREAM_INTERRUPTED_MESSAGE = exports.STREAM_IDLE_TIMEOUT_MESSAGE = exports.StreamFailure = void 0;
const manifest_shared_1 = require("manifest-shared");
class StreamFailure extends Error {
    reason;
    status;
    constructor(reason, status, message, options) {
        super(message, options);
        this.reason = reason;
        this.status = status;
        this.name = 'StreamFailure';
    }
}
exports.StreamFailure = StreamFailure;
exports.STREAM_IDLE_TIMEOUT_MESSAGE = 'Upstream provider stream timed out while waiting for the next event.';
exports.STREAM_INTERRUPTED_MESSAGE = 'Upstream provider stream was interrupted.';
exports.INCOMPLETE_STREAM_MESSAGE = 'Upstream provider stream ended before its completion event.';
class UpstreamStreamError extends StreamFailure {
    constructor(cause) {
        super('stream_interrupted', manifest_shared_1.TRANSPORT_NETWORK_HTTP_STATUS, exports.STREAM_INTERRUPTED_MESSAGE, {
            cause,
        });
        this.name = 'UpstreamStreamError';
    }
}
exports.UpstreamStreamError = UpstreamStreamError;
class StreamIdleTimeoutError extends StreamFailure {
    constructor() {
        super('stream_idle_timeout', manifest_shared_1.TRANSPORT_TIMEOUT_HTTP_STATUS, exports.STREAM_IDLE_TIMEOUT_MESSAGE);
        this.name = 'StreamIdleTimeoutError';
    }
}
exports.StreamIdleTimeoutError = StreamIdleTimeoutError;
function parseEvent(event) {
    let data = null;
    try {
        const parsed = JSON.parse(event.data);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            data = parsed;
        }
    }
    catch {
    }
    const dataType = typeof data?.type === 'string' ? data.type : null;
    return { type: event.event || dataType, data };
}
function nestedRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function providerError(event) {
    const error = nestedRecord(event.data?.error);
    const response = nestedRecord(event.data?.response);
    const responseError = nestedRecord(response?.error);
    const messageCandidates = [
        error?.message,
        responseError?.message,
        event.data?.message,
        response?.status_details,
    ];
    const message = messageCandidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0);
    const statusCandidates = [error?.status, responseError?.status, event.data?.status];
    const status = statusCandidates.find((candidate) => typeof candidate === 'number' &&
        Number.isInteger(candidate) &&
        candidate >= 400 &&
        candidate <= 599);
    return new StreamFailure('upstream_error', status ?? 502, message ?? 'Upstream provider reported a streaming error.');
}
function chatCompletionFinished(data) {
    if (!Array.isArray(data?.choices))
        return false;
    return data.choices.some((choice) => {
        const record = nestedRecord(choice);
        return record?.finish_reason != null;
    });
}
class StreamProtocolObserver {
    protocol;
    completed = false;
    constructor(protocol) {
        this.protocol = protocol;
    }
    observe(event) {
        if (event.data.trim() === '[DONE]') {
            this.completed = true;
            return;
        }
        const parsed = parseEvent(event);
        if (parsed.type === 'error' || parsed.data?.error) {
            throw providerError(parsed);
        }
        if (this.protocol === 'openai_responses') {
            if (parsed.type === 'response.failed') {
                throw providerError(parsed);
            }
            if (parsed.type === 'response.completed' || parsed.type === 'response.incomplete') {
                this.completed = true;
            }
            return;
        }
        if (this.protocol === 'anthropic_messages') {
            if (parsed.type === 'message_stop')
                this.completed = true;
            return;
        }
        if (this.protocol === 'openai_chat_completions') {
            if (chatCompletionFinished(parsed.data))
                this.completed = true;
            return;
        }
    }
    isComplete() {
        return this.completed;
    }
    assertComplete() {
        if (this.protocol === 'google_generate_content' || this.protocol === 'google_code_assist') {
            return;
        }
        if (!this.completed) {
            throw new StreamFailure('incomplete_stream', manifest_shared_1.TRANSPORT_NETWORK_HTTP_STATUS, exports.INCOMPLETE_STREAM_MESSAGE);
        }
    }
}
exports.StreamProtocolObserver = StreamProtocolObserver;
//# sourceMappingURL=stream-protocol.js.map