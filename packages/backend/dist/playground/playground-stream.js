"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeProviderStream = consumeProviderStream;
const codeassist_envelope_1 = require("../routing/oauth/gemini/codeassist-envelope");
const google_adapter_1 = require("../routing/proxy/google-adapter");
const sse_parser_1 = require("../routing/proxy/sse-parser");
const stream_writer_1 = require("../routing/proxy/stream-writer");
function buildChunkTransform(forward, model, providerClient) {
    if (forward.isGoogle) {
        const state = (0, google_adapter_1.createGoogleStreamState)();
        const transform = (event) => {
            const innerEvent = forward.isCodeAssist ? (0, codeassist_envelope_1.unwrapCodeAssistStreamPayload)(event) : event;
            return providerClient.convertGoogleStreamChunk(innerEvent, model, state).chunk;
        };
        transform.finish = () => (0, google_adapter_1.finishGoogleStream)(state, model);
        return transform;
    }
    if (forward.isAnthropic) {
        const transformer = providerClient.createAnthropicStreamTransformer(model);
        return (event) => transformer(event);
    }
    if (forward.isChatGpt) {
        return providerClient.createChatGptStreamTransformer(model);
    }
    return (event) => `data: ${event}\n\n`;
}
function extractDeltas(sse) {
    let text = '';
    let usage = null;
    for (const line of sse.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:'))
            continue;
        const json = trimmed.slice(5).trim();
        if (!json || json === '[DONE]')
            continue;
        try {
            const obj = JSON.parse(json);
            const piece = obj.choices?.[0]?.delta?.content;
            if (typeof piece === 'string')
                text += piece;
            const u = (0, stream_writer_1.parseUsageObject)(obj.usage);
            if (u)
                usage = u;
        }
        catch {
        }
    }
    return { text, usage };
}
const MAX_STREAM_BUFFER = 1_048_576;
async function consumeProviderStream(body, forward, model, providerClient, onDelta, startedAt) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const transform = buildChunkTransform(forward, model, providerClient);
    let content = '';
    let usage = null;
    let ttftMs = null;
    let lastDeltaAt = startedAt;
    const parser = (0, sse_parser_1.createSsePayloadParser)({ maxBufferSize: MAX_STREAM_BUFFER });
    const applySse = (sse) => {
        if (!sse)
            return;
        const { text, usage: u } = extractDeltas(sse);
        if (u)
            usage = u;
        if (text) {
            if (ttftMs === null)
                ttftMs = Date.now() - startedAt;
            content += text;
            lastDeltaAt = Date.now();
            onDelta(text);
        }
    };
    const apply = (event) => applySse(transform(event));
    try {
        let done = false;
        while (!done) {
            const result = await reader.read();
            done = result.done;
            if (result.value) {
                const text = decoder.decode(result.value, { stream: !done });
                for (const event of parser.feed(text))
                    apply(event);
            }
        }
        for (const event of parser.feed(decoder.decode()))
            apply(event);
        for (const event of parser.flush())
            apply(event);
        applySse(transform.finish?.() ?? null);
    }
    finally {
        reader.releaseLock();
    }
    return {
        content,
        usage,
        ttftMs,
        totalMs: (content ? lastDeltaAt : Date.now()) - startedAt,
    };
}
//# sourceMappingURL=playground-stream.js.map