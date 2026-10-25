"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardUrl = getDashboardUrl;
exports.buildFriendlyResponse = buildFriendlyResponse;
exports.sendFriendlyResponse = sendFriendlyResponse;
const crypto_1 = require("crypto");
function getDashboardUrl(config, agentName, section) {
    const baseUrl = config.get('app.betterAuthUrl') ||
        `http://localhost:${config.get('app.port', 3001)}`;
    if (!agentName)
        return baseUrl;
    const suffix = section ? `/${section}` : '';
    return `${baseUrl}/agents/${encodeURIComponent(agentName)}${suffix}`;
}
function buildFriendlyResponse(content, stream, reason = 'manifest_internal_error', errorCode) {
    const id = `chatcmpl-manifest-${(0, crypto_1.randomUUID)()}`;
    const created = Math.floor(Date.now() / 1000);
    const meta = {
        tier: 'simple',
        model: 'manifest',
        provider: 'manifest',
        confidence: 1,
        reason,
        response_mode: stream ? 'stream' : 'buffered',
        manifest_error_code: errorCode,
        manifest_error_message: content,
    };
    if (stream) {
        const chunk = {
            id,
            object: 'chat.completion.chunk',
            created,
            model: 'manifest',
            choices: [{ index: 0, delta: { role: 'assistant', content }, finish_reason: 'stop' }],
        };
        const ssePayload = `data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`;
        const encoder = new TextEncoder();
        const body = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(ssePayload));
                controller.close();
            },
        });
        return {
            forward: {
                response: new Response(body, {
                    status: 200,
                    headers: { 'Content-Type': 'text/event-stream' },
                }),
                isGoogle: false,
                isAnthropic: false,
                isChatGpt: false,
            },
            meta,
        };
    }
    const responseBody = {
        id,
        object: 'chat.completion',
        created,
        model: 'manifest',
        choices: [
            {
                index: 0,
                message: { role: 'assistant', content },
                finish_reason: 'stop',
            },
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
    return {
        forward: {
            response: new Response(JSON.stringify(responseBody), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
            isGoogle: false,
            isAnthropic: false,
            isChatGpt: false,
        },
        meta,
    };
}
function sendFriendlyResponse(res, content, stream) {
    const id = `chatcmpl-manifest-${(0, crypto_1.randomUUID)()}`;
    const created = Math.floor(Date.now() / 1000);
    if (stream) {
        const chunk = {
            id,
            object: 'chat.completion.chunk',
            created,
            model: 'manifest',
            choices: [{ index: 0, delta: { role: 'assistant', content }, finish_reason: 'stop' }],
        };
        const ssePayload = `data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.status(200).send(ssePayload);
    }
    else {
        const responseBody = {
            id,
            object: 'chat.completion',
            created,
            model: 'manifest',
            choices: [
                {
                    index: 0,
                    message: { role: 'assistant', content },
                    finish_reason: 'stop',
                },
            ],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        };
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(responseBody);
    }
}
//# sourceMappingURL=proxy-friendly-response.js.map