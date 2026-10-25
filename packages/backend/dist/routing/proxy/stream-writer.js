"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STREAM_IDLE_TIMEOUT_MS = exports.INCOMPLETE_STREAM_MESSAGE = exports.STREAM_INTERRUPTED_MESSAGE = exports.STREAM_IDLE_TIMEOUT_MESSAGE = exports.UpstreamStreamError = exports.StreamIdleTimeoutError = exports.StreamFailure = void 0;
exports.parseStreamIdleTimeoutMs = parseStreamIdleTimeoutMs;
exports.parseUsageObject = parseUsageObject;
exports.extractUsageFromSse = extractUsageFromSse;
exports.initSseHeaders = initSseHeaders;
exports.pipePassthrough = pipePassthrough;
exports.pipeStream = pipeStream;
const sse_parser_1 = require("./sse-parser");
const stream_protocol_1 = require("./stream-protocol");
var stream_protocol_2 = require("./stream-protocol");
Object.defineProperty(exports, "StreamFailure", { enumerable: true, get: function () { return stream_protocol_2.StreamFailure; } });
Object.defineProperty(exports, "StreamIdleTimeoutError", { enumerable: true, get: function () { return stream_protocol_2.StreamIdleTimeoutError; } });
Object.defineProperty(exports, "UpstreamStreamError", { enumerable: true, get: function () { return stream_protocol_2.UpstreamStreamError; } });
Object.defineProperty(exports, "STREAM_IDLE_TIMEOUT_MESSAGE", { enumerable: true, get: function () { return stream_protocol_2.STREAM_IDLE_TIMEOUT_MESSAGE; } });
Object.defineProperty(exports, "STREAM_INTERRUPTED_MESSAGE", { enumerable: true, get: function () { return stream_protocol_2.STREAM_INTERRUPTED_MESSAGE; } });
Object.defineProperty(exports, "INCOMPLETE_STREAM_MESSAGE", { enumerable: true, get: function () { return stream_protocol_2.INCOMPLETE_STREAM_MESSAGE; } });
exports.DEFAULT_STREAM_IDLE_TIMEOUT_MS = 180_000;
function parseStreamIdleTimeoutMs(rawValue = process.env.STREAM_IDLE_TIMEOUT_MS) {
    if (!rawValue)
        return exports.DEFAULT_STREAM_IDLE_TIMEOUT_MS;
    const parsed = Number.parseInt(rawValue, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : exports.DEFAULT_STREAM_IDLE_TIMEOUT_MS;
}
async function readUpstreamChunk(reader, idleTimeoutMs) {
    let timeout;
    try {
        return await Promise.race([
            reader.read(),
            new Promise((_resolve, reject) => {
                timeout = setTimeout(() => reject(new stream_protocol_1.StreamIdleTimeoutError()), idleTimeoutMs);
            }),
        ]);
    }
    catch (cause) {
        if (cause instanceof stream_protocol_1.StreamFailure)
            throw cause;
        throw new stream_protocol_1.UpstreamStreamError(cause);
    }
    finally {
        if (timeout)
            clearTimeout(timeout);
    }
}
function createProtocolParser(options) {
    const observer = options.protocol ? new stream_protocol_1.StreamProtocolObserver(options.protocol) : null;
    return {
        observer,
        parserOptions: observer
            ? { onEvent: (event) => observer.observe(event) }
            : {},
    };
}
function isAbortAfterProviderOutcome(error, observer) {
    return error instanceof stream_protocol_1.UpstreamStreamError && observer?.isComplete() === true;
}
function parseUsageObject(usage) {
    if (!usage || typeof usage !== 'object')
        return null;
    const u = usage;
    const reportedCostUsd = readReportedCostUsd(u);
    if (typeof u.prompt_tokens === 'number') {
        const promptDetails = typeof u.prompt_tokens_details === 'object' && u.prompt_tokens_details !== null
            ? u.prompt_tokens_details
            : undefined;
        const cacheRead = typeof u.cache_read_tokens === 'number'
            ? u.cache_read_tokens
            : typeof u.prompt_cache_hit_tokens === 'number'
                ? u.prompt_cache_hit_tokens
                : typeof u.cached_tokens === 'number'
                    ? u.cached_tokens
                    : typeof promptDetails?.cached_tokens === 'number'
                        ? promptDetails.cached_tokens
                        : undefined;
        const cacheCreation = typeof u.cache_creation_tokens === 'number'
            ? u.cache_creation_tokens
            : typeof u.cache_creation_input_tokens === 'number'
                ? u.cache_creation_input_tokens
                : typeof promptDetails?.cache_write_tokens === 'number'
                    ? promptDetails.cache_write_tokens
                    : typeof promptDetails?.cache_creation_input_tokens === 'number'
                        ? promptDetails.cache_creation_input_tokens
                        : undefined;
        return {
            prompt_tokens: u.prompt_tokens,
            completion_tokens: typeof u.completion_tokens === 'number' ? u.completion_tokens : 0,
            cache_read_tokens: cacheRead,
            cache_creation_tokens: cacheCreation,
            ...(reportedCostUsd !== undefined ? { reported_cost_usd: reportedCostUsd } : {}),
        };
    }
    if (typeof u.input_tokens === 'number') {
        const inputDetails = typeof u.input_tokens_details === 'object' && u.input_tokens_details !== null
            ? u.input_tokens_details
            : undefined;
        const nativeCacheRead = typeof u.cache_read_input_tokens === 'number' ? u.cache_read_input_tokens : 0;
        const nativeCacheCreation = typeof u.cache_creation_input_tokens === 'number' ? u.cache_creation_input_tokens : 0;
        const isAnthropicNative = nativeCacheRead > 0 || nativeCacheCreation > 0;
        const nestedCacheRead = typeof inputDetails?.cached_tokens === 'number' ? inputDetails.cached_tokens : 0;
        const nestedCacheCreation = typeof inputDetails?.cache_write_tokens === 'number'
            ? inputDetails.cache_write_tokens
            : typeof inputDetails?.cache_creation_input_tokens === 'number'
                ? inputDetails.cache_creation_input_tokens
                : 0;
        const promptTokens = isAnthropicNative
            ? u.input_tokens + nativeCacheRead + nativeCacheCreation
            : u.input_tokens;
        const cacheRead = nativeCacheRead || nestedCacheRead;
        return {
            prompt_tokens: promptTokens,
            completion_tokens: typeof u.output_tokens === 'number' ? u.output_tokens : 0,
            cache_read_tokens: isAnthropicNative ? nativeCacheRead : cacheRead || undefined,
            cache_creation_tokens: isAnthropicNative ? nativeCacheCreation : nestedCacheCreation,
            ...(reportedCostUsd !== undefined ? { reported_cost_usd: reportedCostUsd } : {}),
        };
    }
    return null;
}
function readReportedCostUsd(usage) {
    const direct = readNonNegativeFiniteNumber(usage.cost);
    if (direct !== undefined)
        return direct;
    const details = typeof usage.cost_details === 'object' && usage.cost_details !== null
        ? usage.cost_details
        : undefined;
    return readNonNegativeFiniteNumber(details?.upstream_inference_cost);
}
function readNonNegativeFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}
function extractUsageFromObject(obj) {
    if (!obj || typeof obj !== 'object')
        return null;
    const record = obj;
    const fromUsage = parseUsageObject(record.usage);
    if (fromUsage)
        return fromUsage;
    const response = record.response;
    if (response && typeof response === 'object') {
        return parseUsageObject(response.usage);
    }
    return null;
}
function extractUsageFromJsonPayload(payload) {
    const trimmed = payload.trim();
    if (!trimmed || trimmed === '[DONE]')
        return null;
    try {
        return extractUsageFromObject(JSON.parse(trimmed));
    }
    catch {
        return null;
    }
}
function extractJsonPayloadFromParsedEvent(eventText) {
    return eventText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line &&
        !line.startsWith('event:') &&
        !line.startsWith('id:') &&
        !line.startsWith('retry:') &&
        !line.startsWith(':'))
        .map((line) => (line.startsWith('data:') ? line.slice(5).trim() : line))
        .join('\n')
        .trim();
}
function extractUsageFromSse(sseText) {
    for (const line of sseText.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:'))
            continue;
        const json = trimmed.slice(5).trim();
        const usage = extractUsageFromJsonPayload(json);
        if (usage)
            return usage;
    }
    const usage = extractUsageFromJsonPayload(sseText);
    if (usage)
        return usage;
    const payload = extractJsonPayloadFromParsedEvent(sseText);
    if (!payload || payload === sseText.trim())
        return null;
    return extractUsageFromJsonPayload(payload);
}
function initSseHeaders(res, extraHeaders = {}, statusCode) {
    if (statusCode !== undefined) {
        res.statusCode = statusCode;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    for (const [key, value] of Object.entries(extraHeaders)) {
        res.setHeader(key, value);
    }
    res.flushHeaders();
}
const MAX_SSE_BUFFER_SIZE = sse_parser_1.DEFAULT_MAX_SSE_BUFFER_SIZE;
async function pipePassthrough(source, dest, tap, onClientChunk, options = {}) {
    const reader = source.getReader();
    const decoder = new TextDecoder();
    let capturedUsage = null;
    let streamFailed = false;
    const protocol = createProtocolParser(options);
    const parser = (0, sse_parser_1.createSsePayloadParser)({
        maxBufferSize: MAX_SSE_BUFFER_SIZE,
        ...protocol.parserOptions,
    });
    const idleTimeoutMs = options.idleTimeoutMs ?? parseStreamIdleTimeoutMs();
    try {
        let done = false;
        while (!done) {
            if (dest.writableEnded)
                break;
            const result = await readUpstreamChunk(reader, idleTimeoutMs);
            done = result.done;
            if (result.value) {
                const text = decoder.decode(result.value, { stream: !done });
                options.onUpstreamChunk?.(text);
                const events = parser.feed(text);
                dest.write(Buffer.from(result.value));
                if (onClientChunk)
                    onClientChunk(text);
                for (const event of events) {
                    const tapped = tap(event);
                    if (tapped) {
                        const usage = extractUsageFromSse(tapped);
                        if (usage)
                            capturedUsage = usage;
                    }
                }
            }
        }
        const finalText = decoder.decode();
        if (finalText) {
            options.onUpstreamChunk?.(finalText);
            for (const event of parser.feed(finalText)) {
                const tapped = tap(event);
                if (tapped) {
                    const usage = extractUsageFromSse(tapped);
                    if (usage)
                        capturedUsage = usage;
                }
            }
        }
        for (const event of parser.flush()) {
            const tapped = tap(event);
            if (tapped) {
                const usage = extractUsageFromSse(tapped);
                if (usage)
                    capturedUsage = usage;
            }
        }
        protocol.observer?.assertComplete();
    }
    catch (error) {
        if (isAbortAfterProviderOutcome(error, protocol.observer))
            return capturedUsage;
        streamFailed = error instanceof stream_protocol_1.StreamFailure;
        if (error instanceof stream_protocol_1.StreamIdleTimeoutError)
            await reader.cancel(error).catch(() => undefined);
        throw error;
    }
    finally {
        reader.releaseLock();
        if (!streamFailed && !dest.writableEnded)
            dest.end();
    }
    return capturedUsage;
}
async function pipeStream(source, dest, transform, finalize, onClientChunk, options = {}) {
    const reader = source.getReader();
    const decoder = new TextDecoder();
    let capturedUsage = null;
    let streamFailed = false;
    const protocol = createProtocolParser(options);
    const idleTimeoutMs = options.idleTimeoutMs ?? parseStreamIdleTimeoutMs();
    const writeOut = (s) => {
        dest.write(s);
        if (onClientChunk)
            onClientChunk(s);
    };
    const transformParser = transform
        ? (0, sse_parser_1.createSsePayloadParser)({
            maxBufferSize: MAX_SSE_BUFFER_SIZE,
            ...protocol.parserOptions,
            onComment: (comment) => {
                if (!dest.writableEnded)
                    writeOut((0, sse_parser_1.formatSseComment)(comment));
            },
        })
        : null;
    const passthroughParser = transform
        ? null
        : (0, sse_parser_1.createSsePayloadParser)({
            maxBufferSize: MAX_SSE_BUFFER_SIZE,
            ...protocol.parserOptions,
        });
    const applyTransformedEvents = (events) => {
        if (!transform)
            return;
        for (const event of events) {
            const transformed = transform(event);
            if (transformed) {
                writeOut(transformed);
                const usage = extractUsageFromSse(transformed);
                if (usage)
                    capturedUsage = usage;
            }
        }
    };
    const capturePassthroughUsage = (events) => {
        for (const ev of events) {
            const usage = extractUsageFromSse(ev);
            if (usage)
                capturedUsage = usage;
        }
    };
    const consumeText = (text) => {
        if (!text)
            return;
        if (transform && transformParser) {
            applyTransformedEvents(transformParser.feed(text));
            return;
        }
        if (passthroughParser)
            capturePassthroughUsage(passthroughParser.feed(text));
        writeOut(text);
    };
    try {
        let done = false;
        while (!done) {
            if (dest.writableEnded)
                break;
            const result = await readUpstreamChunk(reader, idleTimeoutMs);
            done = result.done;
            if (result.value) {
                const text = decoder.decode(result.value, { stream: !done });
                options.onUpstreamChunk?.(text);
                consumeText(text);
            }
        }
        const finalText = decoder.decode();
        if (finalText)
            options.onUpstreamChunk?.(finalText);
        consumeText(finalText);
        if (transform && transformParser) {
            applyTransformedEvents(transformParser.flush());
        }
        else if (passthroughParser) {
            capturePassthroughUsage(passthroughParser.flush());
        }
        protocol.observer?.assertComplete();
        if (transform && !dest.writableEnded) {
            if (finalize) {
                const trailing = finalize();
                if (trailing && !dest.writableEnded) {
                    writeOut(trailing);
                    const usage = extractUsageFromSse(trailing);
                    if (usage)
                        capturedUsage = usage;
                }
            }
            else if (!dest.writableEnded) {
                writeOut('data: [DONE]\n\n');
            }
        }
    }
    catch (error) {
        if (isAbortAfterProviderOutcome(error, protocol.observer))
            return capturedUsage;
        streamFailed = error instanceof stream_protocol_1.StreamFailure;
        if (error instanceof stream_protocol_1.StreamIdleTimeoutError)
            await reader.cancel(error).catch(() => undefined);
        throw error;
    }
    finally {
        reader.releaseLock();
        if (!streamFailed && !dest.writableEnded)
            dest.end();
    }
    return capturedUsage;
}
//# sourceMappingURL=stream-writer.js.map