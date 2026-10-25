"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toChatCompletionsRequest = toChatCompletionsRequest;
exports.toNativeResponsesRequest = toNativeResponsesRequest;
exports.fromChatCompletionResponse = fromChatCompletionResponse;
exports.collectResponsesSseResponse = collectResponsesSseResponse;
exports.createResponsesStreamTransformer = createResponsesStreamTransformer;
const crypto_1 = require("crypto");
const chatgpt_helpers_1 = require("./chatgpt-helpers");
const responses_call_ids_1 = require("./responses-call-ids");
const responses_tools_1 = require("./responses-tools");
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function textFromContent(content) {
    if (typeof content === 'string')
        return content;
    if (!Array.isArray(content))
        return '';
    return content
        .filter(isRecord)
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .join('');
}
function textFromRefusal(refusal) {
    return typeof refusal === 'string' ? refusal : '';
}
function incompleteReason(finishReason) {
    if (finishReason === 'length')
        return 'max_output_tokens';
    if (finishReason === 'content_filter')
        return 'content_filter';
    return null;
}
function toChatContent(content, role) {
    if (typeof content === 'string')
        return content;
    if (!Array.isArray(content))
        return content;
    const converted = content.filter(isRecord).map((part) => {
        if (typeof part.text === 'string')
            return { type: 'text', text: part.text };
        if (part.type === 'input_image' && typeof part.image_url === 'string') {
            return { type: 'image_url', image_url: { url: part.image_url } };
        }
        return part;
    });
    if (converted.length === 1 && converted[0]?.type === 'text' && role !== 'assistant') {
        return converted[0].text;
    }
    return converted;
}
function responseInputItemToMessage(item, names) {
    if (item.type === 'function_call') {
        return [
            {
                role: 'assistant',
                content: null,
                tool_calls: [
                    {
                        id: typeof item.call_id === 'string' ? item.call_id : (0, crypto_1.randomUUID)(),
                        type: 'function',
                        function: {
                            name: (0, responses_tools_1.chatToolName)(item, names),
                            arguments: typeof item.arguments === 'string' ? item.arguments : '{}',
                        },
                    },
                ],
            },
        ];
    }
    if (item.type === 'function_call_output') {
        return [
            {
                role: 'tool',
                tool_call_id: typeof item.call_id === 'string' ? item.call_id : (0, crypto_1.randomUUID)(),
                content: item.output === undefined || item.output === null
                    ? ''
                    : typeof item.output === 'string'
                        ? item.output
                        : JSON.stringify(item.output),
            },
        ];
    }
    if (!isNativeResponsesMessageItem(item))
        return [];
    const rawRole = typeof item.role === 'string' ? item.role : 'user';
    const role = rawRole === 'developer' ? 'system' : rawRole;
    const content = toChatContent(item.content, role);
    if (content === undefined)
        return [];
    return [{ role, content }];
}
function toChatCompletionsRequest(body) {
    const messages = [];
    const names = (0, responses_tools_1.responsesToolNames)(body.tools);
    const instructions = body.instructions;
    if (typeof instructions === 'string' && instructions.trim()) {
        messages.push({ role: 'system', content: instructions });
    }
    const input = body.input;
    if (typeof input === 'string') {
        messages.push({ role: 'user', content: input });
    }
    else if (Array.isArray(input)) {
        for (const item of input) {
            if (typeof item === 'string') {
                messages.push({ role: 'user', content: item });
            }
            else if (isRecord(item)) {
                const converted = responseInputItemToMessage(item, names);
                const previous = messages[messages.length - 1];
                const next = converted[0];
                if (previous?.tool_calls && next?.tool_calls) {
                    previous.tool_calls.push(...next.tool_calls);
                }
                else {
                    messages.push(...converted);
                }
            }
        }
    }
    const chatBody = { messages };
    for (const key of [
        'model',
        'temperature',
        'top_p',
        'stream',
        'metadata',
        'store',
        'user',
        'parallel_tool_calls',
    ]) {
        if (body[key] !== undefined)
            chatBody[key] = body[key];
    }
    if (body.max_output_tokens !== undefined)
        chatBody.max_tokens = body.max_output_tokens;
    const responseFormat = toChatResponseFormat(body.text);
    if (responseFormat)
        chatBody.response_format = responseFormat;
    if (Array.isArray(body.tools))
        chatBody.tools = (0, responses_tools_1.chatTools)(body.tools, names);
    const toolChoice = toChatToolChoice(body.tool_choice, names);
    if (toolChoice !== undefined)
        chatBody.tool_choice = toolChoice;
    return chatBody;
}
function toChatResponseFormat(text) {
    if (!isRecord(text) || !isRecord(text.format))
        return undefined;
    const format = text.format;
    if (format.type === 'json_object') {
        return { type: 'json_object' };
    }
    if (format.type !== 'json_schema')
        return undefined;
    const jsonSchema = {};
    if (format.name !== undefined)
        jsonSchema.name = format.name;
    if (format.schema !== undefined)
        jsonSchema.schema = format.schema;
    if (format.strict !== undefined)
        jsonSchema.strict = format.strict;
    if (typeof format.description === 'string' && format.description) {
        jsonSchema.description = format.description;
    }
    return { type: 'json_schema', json_schema: jsonSchema };
}
function toChatToolChoice(toolChoice, names) {
    if (toolChoice === 'auto' || toolChoice === 'none' || toolChoice === 'required')
        return toolChoice;
    if (!isRecord(toolChoice) || toolChoice.type !== 'function')
        return undefined;
    return { type: 'function', function: { name: (0, responses_tools_1.chatToolName)(toolChoice, names) } };
}
const CODEX_SUBSCRIPTION_UNSUPPORTED_PARAMS = [
    'temperature',
    'top_p',
    'max_output_tokens',
    'metadata',
    'safety_identifier',
    'prompt_cache_retention',
    'truncation',
];
function toNativeResponsesRequest(body, model, opts) {
    const request = { ...body, model };
    if (opts?.stripCodexUnsupported) {
        for (const key of CODEX_SUBSCRIPTION_UNSUPPORTED_PARAMS) {
            delete request[key];
        }
        request.store = false;
    }
    else if (body.store === undefined) {
        request.store = false;
    }
    if (opts?.forceStream) {
        request.stream = true;
    }
    else if (body.stream === undefined) {
        request.stream = false;
    }
    if (opts?.inputList) {
        request.input = toNativeResponsesInput(body.input);
    }
    else if (body.input !== undefined) {
        request.input = normalizeNativeResponsesInput(body.input);
    }
    if (Array.isArray(request.input) &&
        (typeof request.previous_response_id !== 'string' || !request.previous_response_id)) {
        request.input = (0, responses_call_ids_1.deduplicateCallIds)(request.input);
    }
    if (opts?.defaultInstructions &&
        (typeof request.instructions !== 'string' || !request.instructions.trim())) {
        request.instructions = chatgpt_helpers_1.DEFAULT_INSTRUCTIONS;
    }
    return request;
}
function normalizeNativeResponsesInput(input) {
    if (!Array.isArray(input))
        return input;
    return input.map((item) => {
        if (!isRecord(item))
            return item;
        if (!isNativeResponsesMessageItem(item))
            return item;
        const role = typeof item.role === 'string' ? item.role : 'user';
        return { ...item, content: toNativeResponsesContent(item.content, role) };
    });
}
function toNativeResponsesInput(input) {
    if (typeof input === 'string') {
        return [{ role: 'user', content: [{ type: 'input_text', text: input }] }];
    }
    if (!Array.isArray(input))
        return input;
    return input.flatMap((item) => {
        if (typeof item === 'string') {
            return [{ role: 'user', content: [{ type: 'input_text', text: item }] }];
        }
        if (!isRecord(item))
            return [];
        if (!isNativeResponsesMessageItem(item))
            return [item];
        const role = typeof item.role === 'string' ? item.role : 'user';
        return [{ ...item, role, content: toNativeResponsesContent(item.content, role) }];
    });
}
function isNativeResponsesMessageItem(item) {
    return item.type === undefined || item.type === 'message';
}
function toNativeResponsesContent(content, role) {
    const partType = role === 'assistant' ? 'output_text' : 'input_text';
    if (typeof content === 'string')
        return [{ type: partType, text: content }];
    if (!Array.isArray(content))
        return content;
    return content.filter(isRecord).map((part) => {
        if (typeof part.text === 'string' && (part.type === 'text' || part.type === undefined)) {
            return { ...part, type: partType };
        }
        if (part.type === 'image_url' && role !== 'assistant') {
            const imageUrl = extractImageUrl(part.image_url);
            if (imageUrl) {
                return { type: 'input_image', image_url: imageUrl, ...extractImageDetail(part) };
            }
        }
        return part;
    });
}
function extractImageUrl(imageUrl) {
    if (typeof imageUrl === 'string')
        return imageUrl;
    if (!isRecord(imageUrl) || typeof imageUrl.url !== 'string')
        return null;
    return imageUrl.url;
}
function extractImageDetail(part) {
    const nested = isRecord(part.image_url) ? part.image_url.detail : undefined;
    const detail = typeof part.detail === 'string' ? part.detail : nested;
    return typeof detail === 'string' ? { detail } : {};
}
function responseTextFormat(format) {
    if (!isRecord(format))
        return { type: 'text' };
    if (format.type === 'json_object')
        return { type: 'json_object' };
    if (format.type !== 'json_schema')
        return { type: 'text' };
    const out = { type: 'json_schema' };
    if (format.name !== undefined)
        out.name = format.name;
    if (format.schema !== undefined)
        out.schema = format.schema;
    if (format.strict !== undefined)
        out.strict = format.strict;
    if (typeof format.description === 'string' && format.description) {
        out.description = format.description;
    }
    return out;
}
function fromChatCompletionResponse(body, model, options = {}) {
    const choices = Array.isArray(body.choices) ? body.choices : [];
    const firstChoice = isRecord(choices[0]) ? choices[0] : {};
    const message = isRecord(firstChoice.message) ? firstChoice.message : {};
    const output = [];
    const outputText = textFromContent(message.content);
    const refusal = textFromRefusal(message.refusal);
    const reason = incompleteReason(firstChoice.finish_reason);
    const itemStatus = reason ? 'incomplete' : 'completed';
    const content = [];
    if (outputText)
        content.push({ type: 'output_text', text: outputText, annotations: [] });
    if (refusal)
        content.push({ type: 'refusal', refusal });
    if (content.length > 0) {
        output.push({
            type: 'message',
            id: `msg_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
            status: itemStatus,
            role: 'assistant',
            content,
        });
    }
    if (Array.isArray(message.tool_calls)) {
        for (const toolCall of message.tool_calls) {
            if (!isRecord(toolCall) || !isRecord(toolCall.function))
                continue;
            output.push({
                type: 'function_call',
                id: `fc_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
                call_id: typeof toolCall.id === 'string' ? toolCall.id : (0, crypto_1.randomUUID)(),
                name: typeof toolCall.function.name === 'string' ? toolCall.function.name : '',
                ...options.toolNames?.get(String(toolCall.function.name)),
                arguments: typeof toolCall.function.arguments === 'string' ? toolCall.function.arguments : '{}',
                status: itemStatus,
            });
        }
    }
    const created = typeof body.created === 'number' ? body.created : Math.floor(Date.now() / 1000);
    return {
        id: `resp_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
        object: 'response',
        created_at: created,
        status: itemStatus,
        completed_at: reason ? null : created,
        error: null,
        incomplete_details: reason ? { reason } : null,
        instructions: null,
        max_output_tokens: null,
        model: typeof body.model === 'string' ? body.model : model,
        output,
        parallel_tool_calls: true,
        previous_response_id: null,
        reasoning: { effort: null, summary: null },
        store: false,
        temperature: null,
        text: { format: responseTextFormat(options.textFormat) },
        tool_choice: 'auto',
        tools: [],
        top_p: null,
        truncation: 'disabled',
        usage: toResponsesUsage(body.usage),
        user: null,
        metadata: {},
    };
}
function toResponsesUsage(usage) {
    if (!isRecord(usage))
        return null;
    const promptTokens = typeof usage.prompt_tokens === 'number' ? usage.prompt_tokens : 0;
    const completionTokens = typeof usage.completion_tokens === 'number' ? usage.completion_tokens : 0;
    const totalTokens = typeof usage.total_tokens === 'number' ? usage.total_tokens : promptTokens + completionTokens;
    const promptDetails = isRecord(usage.prompt_tokens_details)
        ? usage.prompt_tokens_details
        : undefined;
    const completionDetails = isRecord(usage.completion_tokens_details)
        ? usage.completion_tokens_details
        : undefined;
    const cachedTokens = typeof usage.cache_read_tokens === 'number'
        ? usage.cache_read_tokens
        : typeof usage.prompt_cache_hit_tokens === 'number'
            ? usage.prompt_cache_hit_tokens
            : typeof usage.cached_tokens === 'number'
                ? usage.cached_tokens
                : typeof promptDetails?.cached_tokens === 'number'
                    ? promptDetails.cached_tokens
                    : 0;
    const cacheWriteTokens = typeof usage.cache_creation_tokens === 'number'
        ? usage.cache_creation_tokens
        : typeof usage.cache_creation_input_tokens === 'number'
            ? usage.cache_creation_input_tokens
            : typeof promptDetails?.cache_write_tokens === 'number'
                ? promptDetails.cache_write_tokens
                : typeof promptDetails?.cache_creation_input_tokens === 'number'
                    ? promptDetails.cache_creation_input_tokens
                    : 0;
    const reasoningTokens = typeof completionDetails?.reasoning_tokens === 'number'
        ? completionDetails.reasoning_tokens
        : 0;
    return {
        input_tokens: promptTokens,
        input_tokens_details: {
            cached_tokens: cachedTokens,
            cache_write_tokens: cacheWriteTokens,
        },
        output_tokens: completionTokens,
        output_tokens_details: { reasoning_tokens: reasoningTokens },
        total_tokens: totalTokens,
    };
}
const RESPONSES_TERMINAL_EVENTS = new Set([
    'response.completed',
    'response.incomplete',
    'response.failed',
]);
function collectResponsesSseResponse(sseText) {
    let text = '';
    let terminal = null;
    const functionCalls = new Map();
    for (const event of sseText.split('\n\n')) {
        const parsed = parseSseEvent(event);
        if (!parsed)
            continue;
        if (parsed.event === 'response.output_text.delta') {
            const data = safeParse(parsed.data);
            if (typeof data?.delta === 'string')
                text += data.delta;
        }
        else if (parsed.event === 'response.output_item.added') {
            const data = safeParse(parsed.data);
            const item = isRecord(data?.item) ? data.item : null;
            if (item && item.type === 'function_call') {
                const idx = typeof data?.output_index === 'number' ? data.output_index : functionCalls.size;
                functionCalls.set(idx, {
                    type: 'function_call',
                    id: typeof item.id === 'string' ? item.id : '',
                    call_id: typeof item.call_id === 'string' ? item.call_id : '',
                    name: typeof item.name === 'string' ? item.name : '',
                    arguments: typeof item.arguments === 'string' ? item.arguments : '',
                    ...(typeof item.status === 'string' ? { status: item.status } : {}),
                });
            }
        }
        else if (parsed.event === 'response.function_call_arguments.delta') {
            const data = safeParse(parsed.data);
            if (!data)
                continue;
            const idx = typeof data.output_index === 'number' ? data.output_index : 0;
            const fc = functionCalls.get(idx);
            if (fc && typeof data.delta === 'string') {
                const prev = typeof fc.arguments === 'string' ? fc.arguments : '';
                fc.arguments = prev + data.delta;
            }
        }
        else if (parsed.event === 'response.function_call_arguments.done') {
            const data = safeParse(parsed.data);
            if (!data)
                continue;
            const idx = typeof data.output_index === 'number' ? data.output_index : 0;
            const fc = functionCalls.get(idx);
            const nestedItem = isRecord(data.item) ? data.item : null;
            const finalArgs = typeof data.arguments === 'string'
                ? data.arguments
                : nestedItem && typeof nestedItem.arguments === 'string'
                    ? nestedItem.arguments
                    : null;
            if (fc && finalArgs !== null) {
                fc.arguments = finalArgs;
            }
        }
        else if (parsed.event === 'response.output_item.done') {
            const data = safeParse(parsed.data);
            const item = isRecord(data?.item) ? data.item : null;
            if (item && item.type === 'function_call') {
                const idx = typeof data?.output_index === 'number' ? data.output_index : functionCalls.size;
                functionCalls.set(idx, item);
            }
        }
        else if (RESPONSES_TERMINAL_EVENTS.has(parsed.event)) {
            const data = safeParse(parsed.data);
            terminal = isRecord(data?.response) ? data.response : null;
        }
    }
    if (terminal) {
        let result = withCollectedTextOutput(terminal, text);
        if (functionCalls.size > 0) {
            result = withCollectedFunctionCalls(result, functionCalls);
        }
        return result;
    }
    return fromChatCompletionResponse({
        choices: [{ message: { content: text } }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    }, 'unknown');
}
function withCollectedFunctionCalls(response, collected) {
    if (collected.size === 0)
        return response;
    const existing = Array.isArray(response.output) ? response.output : [];
    const existingIds = new Set();
    const existingCallIds = new Set();
    for (const item of existing) {
        if (!isRecord(item) || item.type !== 'function_call')
            continue;
        if (typeof item.id === 'string' && item.id)
            existingIds.add(item.id);
        if (typeof item.call_id === 'string' && item.call_id)
            existingCallIds.add(item.call_id);
    }
    const ordered = [...collected.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);
    const toAdd = ordered.filter((fc) => {
        const id = typeof fc.id === 'string' ? fc.id : '';
        const callId = typeof fc.call_id === 'string' ? fc.call_id : '';
        if (id && existingIds.has(id))
            return false;
        if (callId && existingCallIds.has(callId))
            return false;
        return true;
    });
    if (toAdd.length === 0)
        return response;
    return { ...response, output: [...existing, ...toAdd] };
}
function withCollectedTextOutput(response, text) {
    if (!text)
        return response;
    const output = Array.isArray(response.output) ? response.output : [];
    const hasTextOutput = output.some((item) => {
        if (!isRecord(item) || !Array.isArray(item.content))
            return false;
        return item.content.some((part) => isRecord(part) && part.type === 'output_text' && typeof part.text === 'string');
    });
    if (hasTextOutput)
        return response;
    return {
        ...response,
        output: [
            ...output,
            {
                type: 'message',
                id: `msg_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
                status: response.status === 'incomplete' ? 'incomplete' : 'completed',
                role: 'assistant',
                content: [{ type: 'output_text', text, annotations: [] }],
            },
        ],
    };
}
function parseSseEvent(raw) {
    let event = '';
    let data = '';
    for (const line of raw.split('\n')) {
        if (line.startsWith('event: '))
            event = line.slice(7).trim();
        if (line.startsWith('data: '))
            data += line.slice(6);
    }
    return event || data ? { event, data } : null;
}
function safeParse(data) {
    try {
        const parsed = JSON.parse(data);
        return isRecord(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
function createResponsesStreamTransformer(model, options = {}) {
    const state = {
        toolNames: options.toolNames,
        toolCalls: new Map(),
        nextOutputIndex: 0,
        messageOutputIndex: 0,
        responseId: `resp_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
        itemId: `msg_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
        model,
        createdAt: Math.floor(Date.now() / 1000),
        usage: undefined,
        text: '',
        refusal: '',
        finishReason: null,
        nextContentIndex: 0,
        textFormat: options.textFormat,
        createdEmitted: false,
        itemOpened: false,
        completed: false,
    };
    return {
        transform: (chunk) => transformResponsesStreamChunk(chunk, state),
        finalize: () => finalizeResponsesStream(state),
    };
}
function inProgressResponse(state) {
    const response = fromChatCompletionResponse({ model: state.model, created: state.createdAt, choices: [{ message: { content: '' } }] }, state.model, { textFormat: state.textFormat });
    response.id = state.responseId;
    response.status = 'in_progress';
    response.completed_at = null;
    response.usage = null;
    return response;
}
function emitCreated(state) {
    if (state.createdEmitted)
        return [];
    state.createdEmitted = true;
    const response = inProgressResponse(state);
    return [
        formatResponsesEvent('response.created', { type: 'response.created', response }),
        formatResponsesEvent('response.in_progress', { type: 'response.in_progress', response }),
    ];
}
function emitItemOpen(state) {
    if (state.itemOpened)
        return [];
    state.itemOpened = true;
    state.messageOutputIndex = state.nextOutputIndex++;
    return [
        formatResponsesEvent('response.output_item.added', {
            type: 'response.output_item.added',
            output_index: state.messageOutputIndex,
            item: {
                id: state.itemId,
                type: 'message',
                status: 'in_progress',
                role: 'assistant',
                content: [],
            },
        }),
    ];
}
function emitPartOpen(state, index, part) {
    if (index !== undefined)
        return { events: [], index };
    const events = emitItemOpen(state);
    const contentIndex = state.nextContentIndex++;
    events.push(formatResponsesEvent('response.content_part.added', {
        type: 'response.content_part.added',
        item_id: state.itemId,
        output_index: state.messageOutputIndex,
        content_index: contentIndex,
        part,
    }));
    return { events, index: contentIndex };
}
function emitOutputTextDelta(state, delta) {
    if (!delta)
        return [];
    const opened = emitPartOpen(state, state.textPartIndex, {
        type: 'output_text',
        text: '',
        annotations: [],
    });
    state.textPartIndex = opened.index;
    state.text += delta;
    return [
        ...opened.events,
        formatResponsesEvent('response.output_text.delta', {
            type: 'response.output_text.delta',
            item_id: state.itemId,
            output_index: state.messageOutputIndex,
            content_index: opened.index,
            delta,
        }),
    ];
}
function emitRefusalDelta(state, delta) {
    const opened = emitPartOpen(state, state.refusalPartIndex, { type: 'refusal', refusal: '' });
    state.refusalPartIndex = opened.index;
    state.refusal += delta;
    return [
        ...opened.events,
        formatResponsesEvent('response.refusal.delta', {
            type: 'response.refusal.delta',
            item_id: state.itemId,
            output_index: state.messageOutputIndex,
            content_index: opened.index,
            delta,
        }),
    ];
}
function functionCallItem(call, state, status) {
    return {
        type: 'function_call',
        id: call.id,
        call_id: call.callId,
        name: call.name,
        ...state.toolNames?.get(call.name),
        arguments: status === 'in_progress' ? '' : call.arguments,
        status,
    };
}
function openFunctionCall(call, state) {
    if (call.outputIndex !== undefined)
        return [];
    call.outputIndex = state.nextOutputIndex++;
    return [
        formatResponsesEvent('response.output_item.added', {
            type: 'response.output_item.added',
            output_index: call.outputIndex,
            item: functionCallItem(call, state, 'in_progress'),
        }),
    ];
}
function toolCallDeltas(toolCalls, state) {
    if (!Array.isArray(toolCalls))
        return [];
    const events = [];
    for (const delta of toolCalls) {
        if (!isRecord(delta) || !isRecord(delta.function))
            continue;
        const index = typeof delta.index === 'number' ? delta.index : 0;
        let call = state.toolCalls.get(index);
        if (!call) {
            call = { id: `fc_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`, callId: '', name: '', arguments: '' };
            state.toolCalls.set(index, call);
        }
        if (typeof delta.id === 'string')
            call.callId = delta.id;
        if (typeof delta.function.name === 'string')
            call.name += delta.function.name;
        const args = typeof delta.function.arguments === 'string' ? delta.function.arguments : '';
        call.arguments += args;
        if (!call.name || !call.callId)
            continue;
        if (state.toolNames ? !state.toolNames.has(call.name) : !call.arguments)
            continue;
        const first = call.outputIndex === undefined;
        events.push(...openFunctionCall(call, state));
        const text = first ? call.arguments : args;
        if (text)
            events.push(formatResponsesEvent('response.function_call_arguments.delta', {
                type: 'response.function_call_arguments.delta',
                item_id: call.id,
                output_index: call.outputIndex,
                delta: text,
            }));
    }
    return events;
}
function transformResponsesStreamChunk(chunk, state) {
    const events = [];
    for (const payload of extractDataPayloads(chunk)) {
        if (payload === '[DONE]')
            continue;
        const data = safeParse(payload);
        if (!data)
            continue;
        if (typeof data.model === 'string')
            state.model = data.model;
        if (isRecord(data.usage))
            state.usage = data.usage;
        events.push(...emitCreated(state));
        const choices = Array.isArray(data.choices) ? data.choices : [];
        const choice = isRecord(choices[0]) ? choices[0] : null;
        const delta = isRecord(choice?.delta) ? choice.delta : {};
        if (typeof choice?.finish_reason === 'string' && choice.finish_reason) {
            state.finishReason = choice.finish_reason;
        }
        if (typeof delta.content === 'string' && delta.content.length > 0) {
            events.push(...emitOutputTextDelta(state, delta.content));
        }
        if (typeof delta.refusal === 'string' && delta.refusal.length > 0) {
            events.push(...emitRefusalDelta(state, delta.refusal));
        }
        events.push(...toolCallDeltas(delta.tool_calls, state));
    }
    return events.length > 0 ? events.join('') : null;
}
function finalizeResponsesStream(state) {
    if (state.completed)
        return null;
    state.completed = true;
    const events = [...emitCreated(state)];
    const reason = incompleteReason(state.finishReason);
    const itemStatus = reason ? 'incomplete' : 'completed';
    const parts = [];
    if (state.itemOpened) {
        if (state.textPartIndex !== undefined) {
            const part = { type: 'output_text', text: state.text, annotations: [] };
            parts[state.textPartIndex] = part;
            events.push(formatResponsesEvent('response.output_text.done', {
                type: 'response.output_text.done',
                item_id: state.itemId,
                output_index: state.messageOutputIndex,
                content_index: state.textPartIndex,
                text: state.text,
            }), formatResponsesEvent('response.content_part.done', {
                type: 'response.content_part.done',
                item_id: state.itemId,
                output_index: state.messageOutputIndex,
                content_index: state.textPartIndex,
                part,
            }));
        }
        if (state.refusalPartIndex !== undefined) {
            const part = { type: 'refusal', refusal: state.refusal };
            parts[state.refusalPartIndex] = part;
            events.push(formatResponsesEvent('response.refusal.done', {
                type: 'response.refusal.done',
                item_id: state.itemId,
                output_index: state.messageOutputIndex,
                content_index: state.refusalPartIndex,
                refusal: state.refusal,
            }), formatResponsesEvent('response.content_part.done', {
                type: 'response.content_part.done',
                item_id: state.itemId,
                output_index: state.messageOutputIndex,
                content_index: state.refusalPartIndex,
                part,
            }));
        }
        events.push(formatResponsesEvent('response.output_item.done', {
            type: 'response.output_item.done',
            output_index: state.messageOutputIndex,
            item: {
                id: state.itemId,
                type: 'message',
                status: itemStatus,
                role: 'assistant',
                content: parts,
            },
        }));
    }
    const toolOutput = [];
    for (const call of state.toolCalls.values()) {
        if (!call.name)
            continue;
        if (!call.callId)
            call.callId = (0, crypto_1.randomUUID)();
        events.push(...openFunctionCall(call, state));
        const item = functionCallItem(call, state, itemStatus);
        toolOutput.push({ index: call.outputIndex, item });
        events.push(formatResponsesEvent('response.function_call_arguments.done', {
            type: 'response.function_call_arguments.done',
            item_id: call.id,
            output_index: call.outputIndex,
            arguments: call.arguments,
        }), formatResponsesEvent('response.output_item.done', {
            type: 'response.output_item.done',
            output_index: call.outputIndex,
            item,
        }));
    }
    const response = fromChatCompletionResponse({
        model: state.model,
        created: state.createdAt,
        usage: isRecord(state.usage) ? state.usage : undefined,
        choices: [
            {
                finish_reason: state.finishReason,
                message: { content: state.text, refusal: state.refusal },
            },
        ],
    }, state.model, { textFormat: state.textFormat });
    response.id = state.responseId;
    if (!reason)
        response.completed_at = Math.floor(Date.now() / 1000);
    if (state.itemOpened && Array.isArray(response.output)) {
        const message = response.output.find((item) => isRecord(item) && item.type === 'message');
        message.id = state.itemId;
        message.content = parts;
    }
    const output = response.output.map((item) => ({
        index: state.messageOutputIndex,
        item,
    }));
    response.output = [...output, ...toolOutput]
        .sort((a, b) => a.index - b.index)
        .map(({ item }) => item);
    const terminal = reason ? 'response.incomplete' : 'response.completed';
    events.push(formatResponsesEvent(terminal, { type: terminal, response }), 'data: [DONE]\n\n');
    return events.join('');
}
function extractDataPayloads(chunk) {
    const lines = chunk.split('\n').map((line) => line.trim());
    const dataLines = lines.filter((line) => line.startsWith('data:'));
    if (dataLines.length > 0)
        return dataLines.map((line) => line.slice(5).trim());
    return [chunk.trim()].filter(Boolean);
}
function formatResponsesEvent(event, data) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
//# sourceMappingURL=responses-adapter.js.map