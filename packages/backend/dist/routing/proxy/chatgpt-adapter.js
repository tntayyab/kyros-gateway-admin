"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesSseError = void 0;
exports.toResponsesRequest = toResponsesRequest;
exports.fromResponsesResponse = fromResponsesResponse;
exports.createChatGptStreamTransformer = createChatGptStreamTransformer;
exports.transformResponsesStreamChunk = transformResponsesStreamChunk;
exports.collectChatGptSseResponse = collectChatGptSseResponse;
exports.buildResponsesSseError = buildResponsesSseError;
const crypto_1 = require("crypto");
const chatgpt_helpers_1 = require("./chatgpt-helpers");
const responses_call_ids_1 = require("./responses-call-ids");
class ResponsesSseError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = 'ResponsesSseError';
    }
}
exports.ResponsesSseError = ResponsesSseError;
function toResponsesRequest(body, model, options = {}) {
    const messages = (body.messages ?? []);
    const input = [];
    for (const message of messages) {
        if (message.role === 'system' || message.role === 'developer')
            continue;
        if (message.role === 'assistant' &&
            Array.isArray(message.tool_calls) &&
            message.tool_calls.length > 0) {
            const assistantText = (0, chatgpt_helpers_1.extractTextContent)(message.content);
            if (assistantText) {
                input.push({ role: 'assistant', content: (0, chatgpt_helpers_1.convertContent)(assistantText, 'assistant') });
            }
            input.push(...(0, chatgpt_helpers_1.convertAssistantToolCalls)(message.tool_calls));
            continue;
        }
        if (message.role === 'tool' || message.role === 'function') {
            input.push({
                type: 'function_call_output',
                call_id: typeof message.tool_call_id === 'string' ? message.tool_call_id : (0, crypto_1.randomUUID)(),
                output: (0, chatgpt_helpers_1.extractTextContent)(message.content) ?? JSON.stringify(message.content ?? ''),
            });
            continue;
        }
        input.push({ role: message.role, content: (0, chatgpt_helpers_1.convertContent)(message.content, message.role) });
    }
    const request = {
        model,
        input: (0, responses_call_ids_1.deduplicateCallIds)(input),
        stream: options.stream ?? body.stream !== false,
        store: false,
        instructions: (0, chatgpt_helpers_1.extractInstructions)(messages),
    };
    if (options.mapMaxOutputTokens) {
        const maxOutputTokens = body.max_completion_tokens ?? body.max_tokens;
        if (typeof maxOutputTokens === 'number') {
            request.max_output_tokens = maxOutputTokens;
        }
    }
    if (options.forwardPromptCacheKey &&
        typeof body.prompt_cache_key === 'string' &&
        body.prompt_cache_key) {
        request.prompt_cache_key = body.prompt_cache_key;
    }
    if ((0, chatgpt_helpers_1.isObjectRecord)(body.reasoning)) {
        request.reasoning = body.reasoning;
    }
    else if (options.mapReasoningEffort && typeof body.reasoning_effort === 'string') {
        request.reasoning = { effort: body.reasoning_effort, summary: 'auto' };
    }
    if ((0, chatgpt_helpers_1.isObjectRecord)(body.text)) {
        request.text = body.text;
    }
    else {
        const format = toResponsesTextFormat(body.response_format);
        if (format)
            request.text = { format };
    }
    if (Array.isArray(body.tools)) {
        request.tools = (0, chatgpt_helpers_1.convertTools)(body.tools);
        if (body.tools.length > 0) {
            const toolChoice = toResponsesToolChoice(body.tool_choice);
            if (toolChoice !== undefined)
                request.tool_choice = toolChoice;
            if (typeof body.parallel_tool_calls === 'boolean') {
                request.parallel_tool_calls = body.parallel_tool_calls;
            }
        }
    }
    return request;
}
function toResponsesToolChoice(choice) {
    if (choice === 'auto' || choice === 'none' || choice === 'required')
        return choice;
    if ((0, chatgpt_helpers_1.isObjectRecord)(choice) &&
        choice.type === 'function' &&
        (0, chatgpt_helpers_1.isObjectRecord)(choice.function) &&
        typeof choice.function.name === 'string') {
        return { type: 'function', name: choice.function.name };
    }
    return undefined;
}
function toResponsesTextFormat(responseFormat) {
    if (!(0, chatgpt_helpers_1.isObjectRecord)(responseFormat))
        return undefined;
    if (responseFormat.type === 'json_object')
        return { type: 'json_object' };
    if (responseFormat.type !== 'json_schema' || !(0, chatgpt_helpers_1.isObjectRecord)(responseFormat.json_schema)) {
        return undefined;
    }
    const jsonSchema = responseFormat.json_schema;
    const format = { type: 'json_schema' };
    if (jsonSchema.name !== undefined)
        format.name = jsonSchema.name;
    if (jsonSchema.schema !== undefined)
        format.schema = jsonSchema.schema;
    if (jsonSchema.strict !== undefined)
        format.strict = jsonSchema.strict;
    if (typeof jsonSchema.description === 'string' && jsonSchema.description) {
        format.description = jsonSchema.description;
    }
    return format;
}
function textFromReasoningParts(parts) {
    if (!Array.isArray(parts))
        return '';
    return parts
        .filter(chatgpt_helpers_1.isObjectRecord)
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .filter(Boolean)
        .join('\n\n');
}
function reasoningContentFromItem(item) {
    return [textFromReasoningParts(item.summary), textFromReasoningParts(item.content)]
        .filter(Boolean)
        .join('\n\n');
}
function responseOutputItems(response) {
    const output = Array.isArray(response?.output) ? response.output : [];
    return output.filter(chatgpt_helpers_1.isObjectRecord);
}
function hasResponseOutput(response) {
    return Array.isArray(response?.output);
}
function reasoningContentFromOutput(output) {
    return output
        .filter((item) => item.type === 'reasoning')
        .map(reasoningContentFromItem)
        .filter(Boolean)
        .join('\n\n');
}
function isReasoningDeltaEvent(eventType) {
    return eventType.startsWith('response.reasoning_summary') && eventType.endsWith('.delta');
}
function reasoningDeltaText(data) {
    if (typeof data.delta === 'string')
        return data.delta;
    if ((0, chatgpt_helpers_1.isObjectRecord)(data.delta) && typeof data.delta.text === 'string')
        return data.delta.text;
    return '';
}
function reasoningBackfillFrame(response, state, model) {
    if (!state || state.streamed)
        return '';
    const reasoning = reasoningContentFromOutput(responseOutputItems(response));
    if (!reasoning)
        return '';
    state.streamed = true;
    return (0, chatgpt_helpers_1.formatSSE)({ delta: { reasoning_content: reasoning }, finish_reason: null }, model);
}
function fromResponsesResponse(data, model) {
    const output = (data.output ?? []);
    let text = '';
    const reasoningParts = [];
    const toolCalls = [];
    for (const item of output) {
        if (item.type === 'reasoning') {
            const reasoning = reasoningContentFromItem(item);
            if (reasoning)
                reasoningParts.push(reasoning);
            continue;
        }
        if (item.type === 'message') {
            const content = item.content;
            if (!content)
                continue;
            for (const part of content) {
                if (part.type === 'output_text' && part.text)
                    text += part.text;
            }
            continue;
        }
        if (item.type === 'function_call') {
            toolCalls.push({
                id: item.call_id ?? (0, crypto_1.randomUUID)(),
                type: 'function',
                function: {
                    name: item.name ?? '',
                    arguments: item.arguments ?? '{}',
                },
            });
        }
    }
    const usage = data.usage ?? {};
    const inputDetails = usage.input_tokens_details;
    const message = {
        role: 'assistant',
        content: text || null,
    };
    const reasoningContent = reasoningParts.join('\n\n');
    if (reasoningContent)
        message.reasoning_content = reasoningContent;
    if (toolCalls.length > 0) {
        message.tool_calls = toolCalls;
    }
    return {
        id: `chatcmpl-${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 29)}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            {
                index: 0,
                message,
                finish_reason: data.status === 'incomplete'
                    ? incompleteFinishReason(data)
                    : toolCalls.length > 0
                        ? 'tool_calls'
                        : 'stop',
            },
        ],
        usage: {
            prompt_tokens: usage.input_tokens ?? 0,
            completion_tokens: usage.output_tokens ?? 0,
            total_tokens: usage.total_tokens ?? 0,
            cache_read_tokens: inputDetails?.cached_tokens ?? 0,
            cache_creation_tokens: inputDetails?.cache_write_tokens ?? inputDetails?.cache_creation_input_tokens ?? 0,
        },
    };
}
function createChatGptStreamTransformer(model) {
    const state = { streamed: false, sawToolCall: false };
    return (chunk) => transformResponsesStreamChunk(chunk, model, state);
}
function transformResponsesStreamChunk(chunk, model, state) {
    const lines = chunk.split('\n');
    let eventType = '';
    let dataStr = '';
    for (const line of lines) {
        if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
        }
        else if (line.startsWith('data: ')) {
            dataStr = line.slice(6);
        }
        else if (line.trim()) {
            dataStr = line.trim();
        }
    }
    if (!eventType && !dataStr)
        return null;
    if (eventType === 'response.output_text.delta') {
        const data = (0, chatgpt_helpers_1.safeParse)(dataStr);
        if (!data)
            return null;
        const delta = typeof data.delta === 'string' ? data.delta : '';
        return (0, chatgpt_helpers_1.formatSSE)({ delta: { content: delta }, finish_reason: null }, model);
    }
    if (isReasoningDeltaEvent(eventType)) {
        const data = (0, chatgpt_helpers_1.safeParse)(dataStr);
        if (!data)
            return null;
        const text = reasoningDeltaText(data);
        if (text && state)
            state.streamed = true;
        return (0, chatgpt_helpers_1.formatSSE)({ delta: { reasoning_content: text }, finish_reason: null }, model);
    }
    if (eventType === 'response.function_call_arguments.delta') {
        const data = (0, chatgpt_helpers_1.safeParse)(dataStr);
        if (!data)
            return null;
        const delta = typeof data.delta === 'string' ? data.delta : '';
        return (0, chatgpt_helpers_1.formatSSE)({
            delta: {
                tool_calls: [
                    {
                        index: typeof data.output_index === 'number' ? data.output_index : 0,
                        function: { arguments: delta },
                    },
                ],
            },
            finish_reason: null,
        }, model);
    }
    if (eventType === 'response.output_item.added') {
        const data = (0, chatgpt_helpers_1.safeParse)(dataStr);
        if (!data)
            return null;
        const item = (0, chatgpt_helpers_1.isObjectRecord)(data.item) ? data.item : undefined;
        if (item?.type !== 'function_call')
            return null;
        if (state)
            state.sawToolCall = true;
        return (0, chatgpt_helpers_1.formatSSE)({
            delta: {
                tool_calls: [
                    {
                        index: typeof data.output_index === 'number' ? data.output_index : 0,
                        id: item.call_id ?? '',
                        type: 'function',
                        function: { name: item.name ?? '', arguments: '' },
                    },
                ],
            },
            finish_reason: null,
        }, model);
    }
    if (eventType === 'response.completed') {
        return handleCompletedEvent(dataStr, model, state);
    }
    if (eventType === 'response.incomplete') {
        return handleIncompleteEvent(dataStr, model, state);
    }
    if (eventType === 'error' || eventType === 'response.failed') {
        return handleStreamErrorEvent(dataStr);
    }
    return null;
}
function handleCompletedEvent(dataStr, model, state) {
    const data = (0, chatgpt_helpers_1.safeParse)(dataStr);
    const response = (0, chatgpt_helpers_1.isObjectRecord)(data?.response) ? data.response : undefined;
    const responseOutput = responseOutputItems(response);
    const hasFunctionCalls = responseOutput.some((item) => item.type === 'function_call');
    const sawToolCall = state?.sawToolCall ?? false;
    const finish = (0, chatgpt_helpers_1.formatSSE)({ delta: {}, finish_reason: hasFunctionCalls || sawToolCall ? 'tool_calls' : 'stop' }, model, extractResponseUsage(response));
    return `${reasoningBackfillFrame(response, state, model)}${finish}\ndata: [DONE]\n\n`;
}
function handleIncompleteEvent(dataStr, model, state) {
    const data = (0, chatgpt_helpers_1.safeParse)(dataStr);
    const response = (0, chatgpt_helpers_1.isObjectRecord)(data?.response) ? data.response : undefined;
    const finish = (0, chatgpt_helpers_1.formatSSE)({ delta: {}, finish_reason: incompleteFinishReason(response) }, model, extractResponseUsage(response));
    return `${reasoningBackfillFrame(response, state, model)}${finish}\ndata: [DONE]\n\n`;
}
function incompleteFinishReason(response) {
    const details = (0, chatgpt_helpers_1.isObjectRecord)(response?.incomplete_details)
        ? response.incomplete_details
        : undefined;
    return details?.reason === 'content_filter' ? 'content_filter' : 'length';
}
function extractResponseUsage(response) {
    const responseUsage = response?.usage;
    if (!responseUsage)
        return undefined;
    const inputDetails = responseUsage.input_tokens_details;
    return {
        prompt_tokens: responseUsage.input_tokens ?? 0,
        completion_tokens: responseUsage.output_tokens ?? 0,
        total_tokens: responseUsage.total_tokens ?? 0,
        cache_read_tokens: inputDetails?.cached_tokens ?? 0,
        cache_creation_tokens: inputDetails?.cache_write_tokens ?? inputDetails?.cache_creation_input_tokens ?? 0,
    };
}
function handleStreamErrorEvent(dataStr) {
    const data = (0, chatgpt_helpers_1.safeParse)(dataStr) ?? {};
    const err = buildResponsesSseError(data);
    const parsedBody = (0, chatgpt_helpers_1.safeParse)(err.body);
    const parsedError = (0, chatgpt_helpers_1.isObjectRecord)(parsedBody?.error) ? parsedBody.error : {};
    const message = typeof parsedError.message === 'string' && parsedError.message
        ? parsedError.message
        : err.message;
    const code = typeof parsedError.code === 'string' ? parsedError.code : undefined;
    const type = typeof parsedError.type === 'string' ? parsedError.type : 'upstream_error';
    const payload = {
        error: {
            message,
            type,
            status: err.status,
            ...(code ? { code } : {}),
        },
    };
    return `data: ${JSON.stringify(payload)}\n\ndata: [DONE]\n\n`;
}
function collectChatGptSseResponse(sseText, model) {
    let text = '';
    const toolCallMap = new Map();
    let usage;
    let hasFunctionCalls = false;
    let finishReasonOverride;
    let reasoningContent = '';
    const events = sseText.split('\n\n');
    for (const event of events) {
        const lines = event.split('\n');
        let eventType = '';
        let dataStr = '';
        for (const line of lines) {
            if (line.startsWith('event: '))
                eventType = line.slice(7).trim();
            else if (line.startsWith('data: '))
                dataStr = line.slice(6);
        }
        if (!eventType || !dataStr)
            continue;
        const data = (0, chatgpt_helpers_1.safeParse)(dataStr);
        if (!data)
            continue;
        if (eventType === 'error' || eventType === 'response.failed') {
            throw buildResponsesSseError(data);
        }
        else if (eventType === 'response.output_text.delta') {
            text += typeof data.delta === 'string' ? data.delta : '';
        }
        else if (isReasoningDeltaEvent(eventType)) {
            reasoningContent += reasoningDeltaText(data);
        }
        else if (eventType === 'response.output_item.added') {
            const item = (0, chatgpt_helpers_1.isObjectRecord)(data.item) ? data.item : undefined;
            if (item?.type === 'function_call') {
                const idx = typeof data.output_index === 'number' ? data.output_index : toolCallMap.size;
                toolCallMap.set(idx, {
                    id: item.call_id ?? '',
                    type: 'function',
                    function: { name: item.name ?? '', arguments: '' },
                });
            }
        }
        else if (eventType === 'response.function_call_arguments.delta') {
            const idx = typeof data.output_index === 'number' ? data.output_index : 0;
            const tc = toolCallMap.get(idx);
            if (tc) {
                tc.function.arguments += typeof data.delta === 'string' ? data.delta : '';
            }
        }
        else if (eventType === 'response.completed') {
            const response = (0, chatgpt_helpers_1.isObjectRecord)(data.response) ? data.response : undefined;
            usage = extractResponseUsage(response) ?? usage;
            const output = responseOutputItems(response);
            hasFunctionCalls = output.some((item) => item.type === 'function_call');
            if (hasResponseOutput(response)) {
                reasoningContent = reasoningContentFromOutput(output);
            }
        }
        else if (eventType === 'response.incomplete') {
            const response = (0, chatgpt_helpers_1.isObjectRecord)(data.response) ? data.response : undefined;
            usage = extractResponseUsage(response) ?? usage;
            finishReasonOverride = incompleteFinishReason(response);
            if (hasResponseOutput(response)) {
                reasoningContent = reasoningContentFromOutput(responseOutputItems(response));
            }
        }
    }
    const toolCalls = [...toolCallMap.values()];
    const message = { role: 'assistant', content: text || null };
    if (reasoningContent)
        message.reasoning_content = reasoningContent;
    if (toolCalls.length > 0)
        message.tool_calls = toolCalls;
    return {
        id: `chatcmpl-${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 29)}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            {
                index: 0,
                message,
                finish_reason: finishReasonOverride ??
                    (hasFunctionCalls || toolCalls.length > 0 ? 'tool_calls' : 'stop'),
            },
        ],
        usage: usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
}
function buildResponsesSseError(data) {
    const response = (0, chatgpt_helpers_1.isObjectRecord)(data.response) ? data.response : undefined;
    const error = (0, chatgpt_helpers_1.isObjectRecord)(data.error)
        ? data.error
        : (0, chatgpt_helpers_1.isObjectRecord)(response?.error)
            ? response.error
            : data;
    const message = typeof error.message === 'string' && error.message
        ? error.message
        : 'OpenAI Responses stream failed';
    const code = typeof error.code === 'string' ? error.code : undefined;
    const type = typeof error.type === 'string' ? error.type : undefined;
    const status = statusFromResponsesError(code, type);
    const body = JSON.stringify({
        error: {
            message,
            ...(code ? { code } : {}),
            ...(type ? { type } : {}),
        },
    });
    return new ResponsesSseError(message, status, body);
}
function statusFromResponsesError(code, type) {
    const value = `${code ?? ''} ${type ?? ''}`.toLowerCase();
    if (value.includes('model_not_found') || value.includes('not_found'))
        return 404;
    if (value.includes('rate_limit'))
        return 429;
    if (value.includes('unauthorized') || value.includes('authentication'))
        return 401;
    if (value.includes('forbidden') || value.includes('permission'))
        return 403;
    if (value.includes('server'))
        return 500;
    if (value.includes('context_length_exceeded'))
        return 400;
    if (value.includes('invalid') || value.includes('bad_request'))
        return 400;
    return 502;
}
//# sourceMappingURL=chatgpt-adapter.js.map