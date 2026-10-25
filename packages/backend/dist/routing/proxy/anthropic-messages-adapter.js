"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesToChatCompletionsRequest = messagesToChatCompletionsRequest;
exports.chatCompletionsResponseToMessages = chatCompletionsResponseToMessages;
exports.createMessagesStreamTransformer = createMessagesStreamTransformer;
const crypto_1 = require("crypto");
const sanitizeToolUseId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '_');
const DEFAULT_CUSTOM_TOOL_INPUT_SCHEMA = {
    type: 'object',
    properties: {},
    additionalProperties: false,
};
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function normalizeOpenAiFunctionSchema(schema) {
    if (schema === null || schema === undefined || typeof schema !== 'object') {
        return schema;
    }
    if (Array.isArray(schema)) {
        return schema.map((item) => normalizeOpenAiFunctionSchema(item));
    }
    const result = {};
    for (const [key, value] of Object.entries(schema)) {
        result[key] = normalizeOpenAiFunctionSchema(value);
    }
    const type = result.type;
    const isArraySchema = type === 'array' || (Array.isArray(type) && type.some((item) => item === 'array'));
    if (isArraySchema && result.items === undefined) {
        result.items = {};
    }
    return result;
}
function safeJsonStringify(value) {
    try {
        return typeof value === 'string' ? value : JSON.stringify(value ?? '');
    }
    catch {
        return '';
    }
}
function systemToString(system) {
    if (typeof system === 'string')
        return system;
    if (!Array.isArray(system))
        return '';
    return system
        .filter(isRecord)
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .filter(Boolean)
        .join('\n\n');
}
function imageBlockToImagePart(block) {
    if (!isRecord(block.source))
        return null;
    const source = block.source;
    if (source.type === 'base64' && typeof source.data === 'string') {
        const mediaType = typeof source.media_type === 'string' ? source.media_type : 'image/png';
        return { type: 'image_url', image_url: { url: `data:${mediaType};base64,${source.data}` } };
    }
    if (source.type === 'url' && typeof source.url === 'string') {
        return { type: 'image_url', image_url: { url: source.url } };
    }
    return null;
}
function buildAssistantMessage(content) {
    let text = '';
    let reasoning = '';
    const toolCalls = [];
    const collect = (block) => {
        if (block.type === 'text' && typeof block.text === 'string') {
            text += block.text;
        }
        else if (block.type === 'thinking' && typeof block.thinking === 'string') {
            reasoning += block.thinking;
        }
        else if (block.type === 'tool_use') {
            toolCalls.push({
                id: typeof block.id === 'string' ? block.id : (0, crypto_1.randomUUID)(),
                type: 'function',
                function: {
                    name: typeof block.name === 'string' ? block.name : 'unknown',
                    arguments: safeJsonStringify(block.input ?? {}),
                },
            });
        }
    };
    if (typeof content === 'string') {
        text = content;
    }
    else if (Array.isArray(content)) {
        for (const block of content) {
            if (isRecord(block))
                collect(block);
        }
    }
    if (!text && toolCalls.length === 0 && !reasoning)
        return [];
    const message = { role: 'assistant', content: text || null };
    if (toolCalls.length > 0)
        message.tool_calls = toolCalls;
    if (reasoning)
        message.reasoning_content = reasoning;
    return [message];
}
function splitToolResultContent(content) {
    if (!Array.isArray(content)) {
        return { toolContent: safeJsonStringify(content), imageParts: [] };
    }
    const imageParts = [];
    const sanitized = content.map((block) => {
        if (!isRecord(block) || block.type !== 'image')
            return block;
        const part = imageBlockToImagePart(block);
        if (!part)
            return block;
        imageParts.push(part);
        return { type: 'text', text: '[image attached below]' };
    });
    return { toolContent: safeJsonStringify(sanitized), imageParts };
}
function flushToolImages(messages, pendingToolImages) {
    if (pendingToolImages.length === 0)
        return;
    messages.push({
        role: 'user',
        content: [
            { type: 'text', text: 'Images from the preceding tool result:' },
            ...pendingToolImages,
        ],
    });
    pendingToolImages.length = 0;
}
function buildUserMessages(content, pendingToolImages) {
    if (typeof content === 'string') {
        const messages = [];
        flushToolImages(messages, pendingToolImages);
        if (content)
            messages.push({ role: 'user', content });
        return messages;
    }
    if (!Array.isArray(content))
        return [];
    const messages = [];
    let pendingParts = [];
    const flushPendingUser = () => {
        if (pendingParts.length === 0)
            return;
        const hasNonText = pendingParts.some((p) => p.type !== 'text');
        if (hasNonText) {
            messages.push({ role: 'user', content: pendingParts });
        }
        else {
            const text = pendingParts.map((p) => (typeof p.text === 'string' ? p.text : '')).join('');
            if (text)
                messages.push({ role: 'user', content: text });
        }
        pendingParts = [];
    };
    for (const block of content) {
        if (!isRecord(block))
            continue;
        if (block.type === 'tool_result') {
            flushPendingUser();
            const { toolContent, imageParts } = splitToolResultContent(block.content);
            messages.push({
                role: 'tool',
                tool_call_id: typeof block.tool_use_id === 'string' ? block.tool_use_id : 'unknown',
                content: toolContent,
            });
            pendingToolImages.push(...imageParts);
        }
        else if (block.type === 'text' && typeof block.text === 'string') {
            flushToolImages(messages, pendingToolImages);
            pendingParts.push({ type: 'text', text: block.text });
        }
        else if (block.type === 'image') {
            flushToolImages(messages, pendingToolImages);
            const part = imageBlockToImagePart(block);
            if (part)
                pendingParts.push(part);
        }
    }
    flushPendingUser();
    return messages;
}
function toChatTools(tools) {
    return tools.filter(isRecord).map((tool) => ({
        type: 'function',
        function: {
            name: typeof tool.name === 'string' ? tool.name : 'unknown',
            ...(typeof tool.description === 'string' && { description: tool.description }),
            ...(tool.input_schema !== undefined
                ? { parameters: normalizeOpenAiFunctionSchema(tool.input_schema) }
                : typeof tool.type === 'string' && tool.type !== 'custom'
                    ? { parameters: DEFAULT_CUSTOM_TOOL_INPUT_SCHEMA }
                    : {}),
        },
    }));
}
function toChatToolChoice(choice) {
    if (!isRecord(choice))
        return undefined;
    if (choice.type === 'auto')
        return 'auto';
    if (choice.type === 'any')
        return 'required';
    if (choice.type === 'none')
        return 'none';
    if (choice.type === 'tool' && typeof choice.name === 'string') {
        return { type: 'function', function: { name: choice.name } };
    }
    return undefined;
}
function messagesToChatCompletionsRequest(body) {
    const messages = [];
    const pendingToolImages = [];
    const systemText = systemToString(body.system);
    if (systemText)
        messages.push({ role: 'system', content: systemText });
    const inputMessages = Array.isArray(body.messages) ? body.messages : [];
    for (const item of inputMessages) {
        if (!isRecord(item))
            continue;
        const role = item.role === 'assistant' ? 'assistant' : 'user';
        if (role === 'assistant') {
            flushToolImages(messages, pendingToolImages);
            messages.push(...buildAssistantMessage(item.content));
        }
        else {
            messages.push(...buildUserMessages(item.content, pendingToolImages));
        }
    }
    flushToolImages(messages, pendingToolImages);
    const chatBody = { messages };
    if (typeof body.model === 'string')
        chatBody.model = body.model;
    if (body.max_tokens !== undefined)
        chatBody.max_tokens = body.max_tokens;
    if (body.temperature !== undefined)
        chatBody.temperature = body.temperature;
    if (body.top_p !== undefined)
        chatBody.top_p = body.top_p;
    if (body.stream !== undefined)
        chatBody.stream = body.stream;
    if (body.metadata !== undefined)
        chatBody.metadata = body.metadata;
    if (body.stop_sequences !== undefined)
        chatBody.stop = body.stop_sequences;
    if (body.thinking !== undefined)
        chatBody.thinking = body.thinking;
    if (body.top_k !== undefined)
        chatBody.top_k = body.top_k;
    if (Array.isArray(body.tools))
        chatBody.tools = toChatTools(body.tools);
    const toolChoice = toChatToolChoice(body.tool_choice);
    if (toolChoice !== undefined)
        chatBody.tool_choice = toolChoice;
    if (isRecord(body.tool_choice) &&
        body.tool_choice.disable_parallel_tool_use === true &&
        Array.isArray(chatBody.tools) &&
        chatBody.tools.length > 0) {
        chatBody.parallel_tool_calls = false;
    }
    return chatBody;
}
const STOP_REASON_MAP = {
    stop: 'end_turn',
    length: 'max_tokens',
    tool_calls: 'tool_use',
    content_filter: 'refusal',
};
function toAnthropicStopReason(finishReason) {
    if (typeof finishReason !== 'string')
        return 'end_turn';
    return STOP_REASON_MAP[finishReason] ?? 'end_turn';
}
function toAnthropicUsage(usage) {
    const u = isRecord(usage) ? usage : {};
    const promptTokens = typeof u.prompt_tokens === 'number' ? u.prompt_tokens : 0;
    const outputTokens = typeof u.completion_tokens === 'number' ? u.completion_tokens : 0;
    const promptDetails = isRecord(u.prompt_tokens_details) ? u.prompt_tokens_details : undefined;
    const cacheRead = typeof u.cache_read_tokens === 'number'
        ? u.cache_read_tokens
        : typeof u.prompt_cache_hit_tokens === 'number'
            ? u.prompt_cache_hit_tokens
            : typeof u.cached_tokens === 'number'
                ? u.cached_tokens
                : typeof promptDetails?.cached_tokens === 'number'
                    ? promptDetails.cached_tokens
                    : 0;
    const cacheCreation = typeof u.cache_creation_tokens === 'number'
        ? u.cache_creation_tokens
        : typeof u.cache_creation_input_tokens === 'number'
            ? u.cache_creation_input_tokens
            : typeof promptDetails?.cache_write_tokens === 'number'
                ? promptDetails.cache_write_tokens
                : typeof promptDetails?.cache_creation_input_tokens === 'number'
                    ? promptDetails.cache_creation_input_tokens
                    : 0;
    const inputTokens = Math.max(0, promptTokens - cacheRead - cacheCreation);
    return {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cache_creation_input_tokens: cacheCreation,
        cache_read_input_tokens: cacheRead,
    };
}
function safeParseJson(value) {
    if (typeof value !== 'string')
        return value ?? {};
    try {
        return JSON.parse(value);
    }
    catch {
        return {};
    }
}
function chatCompletionsResponseToMessages(body, model) {
    const choices = Array.isArray(body.choices) ? body.choices : [];
    const firstChoice = isRecord(choices[0]) ? choices[0] : {};
    const message = isRecord(firstChoice.message) ? firstChoice.message : {};
    const content = [];
    if (typeof message.reasoning_content === 'string' && message.reasoning_content) {
        content.push({ type: 'thinking', thinking: message.reasoning_content });
    }
    const text = typeof message.content === 'string'
        ? message.content
        : Array.isArray(message.content)
            ? message.content
                .filter(isRecord)
                .map((p) => (typeof p.text === 'string' ? p.text : ''))
                .join('')
            : '';
    if (text)
        content.push({ type: 'text', text });
    if (Array.isArray(message.tool_calls)) {
        for (const call of message.tool_calls) {
            if (!isRecord(call) || !isRecord(call.function))
                continue;
            content.push({
                type: 'tool_use',
                id: typeof call.id === 'string' && call.id !== ''
                    ? sanitizeToolUseId(call.id)
                    : `toolu_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
                name: typeof call.function.name === 'string' ? call.function.name : '',
                input: safeParseJson(call.function.arguments),
            });
        }
    }
    const stopReason = toAnthropicStopReason(firstChoice.finish_reason);
    return {
        id: typeof body.id === 'string' ? body.id : `msg_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
        type: 'message',
        role: 'assistant',
        model: typeof body.model === 'string' ? body.model : model,
        content,
        stop_reason: stopReason,
        stop_sequence: null,
        usage: toAnthropicUsage(body.usage),
    };
}
function createMessagesStreamTransformer(model) {
    const state = {
        messageId: `msg_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
        model,
        startedMessage: false,
        thinkingIndex: null,
        thinkingOpened: false,
        textIndex: null,
        textOpened: false,
        toolCalls: new Map(),
        nextBlockIndexCounter: 0,
        finalUsage: null,
        stopReason: null,
        endedMessage: false,
    };
    return {
        transform: (chunk) => transformStreamChunk(chunk, state),
        finalize: () => {
            const events = closeStream(state);
            return events.length > 0 ? events.join('') : null;
        },
    };
}
function transformStreamChunk(chunk, state) {
    const events = [];
    for (const payload of extractDataPayloads(chunk)) {
        if (state.endedMessage)
            break;
        if (payload === '[DONE]')
            continue;
        const data = safeParse(payload);
        if (!data)
            continue;
        if (isRecord(data.error)) {
            events.push(buildStreamErrorEvent(state, data.error));
            break;
        }
        if (!state.startedMessage) {
            events.push(buildMessageStartEvent(state, data));
            state.startedMessage = true;
        }
        const choices = Array.isArray(data.choices) ? data.choices : [];
        if (choices.length === 0 && isRecord(data.usage)) {
            state.finalUsage = toAnthropicUsage(data.usage);
            continue;
        }
        const choice = isRecord(choices[0]) ? choices[0] : null;
        if (!choice)
            continue;
        const delta = isRecord(choice.delta) ? choice.delta : {};
        if (typeof delta.reasoning_content === 'string' && delta.reasoning_content.length > 0) {
            if (!hasOpenToolCall(state)) {
                closeTextBlock(state, events);
                if (!state.thinkingOpened) {
                    state.thinkingIndex = nextBlockIndex(state);
                    events.push(formatMessagesEvent('content_block_start', {
                        type: 'content_block_start',
                        index: state.thinkingIndex,
                        content_block: { type: 'thinking', thinking: '' },
                    }));
                    state.thinkingOpened = true;
                }
                events.push(formatMessagesEvent('content_block_delta', {
                    type: 'content_block_delta',
                    index: state.thinkingIndex,
                    delta: { type: 'thinking_delta', thinking: delta.reasoning_content },
                }));
            }
        }
        if (typeof delta.content === 'string' && delta.content.length > 0) {
            closeThinkingBlock(state, events);
            closeOpenToolCalls(state, events);
            if (!state.textOpened) {
                state.textIndex = nextBlockIndex(state);
                events.push(formatMessagesEvent('content_block_start', {
                    type: 'content_block_start',
                    index: state.textIndex,
                    content_block: { type: 'text', text: '' },
                }));
                state.textOpened = true;
            }
            events.push(formatMessagesEvent('content_block_delta', {
                type: 'content_block_delta',
                index: state.textIndex,
                delta: { type: 'text_delta', text: delta.content },
            }));
        }
        if (Array.isArray(delta.tool_calls)) {
            closeThinkingBlock(state, events);
            closeTextBlock(state, events);
            for (const call of delta.tool_calls) {
                if (!isRecord(call))
                    continue;
                const callIndex = typeof call.index === 'number' ? call.index : 0;
                let entry = state.toolCalls.get(callIndex);
                if (!entry) {
                    entry = {
                        id: typeof call.id === 'string' && call.id !== ''
                            ? sanitizeToolUseId(call.id)
                            : `toolu_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
                        index: nextBlockIndex(state),
                        argBuffer: '',
                        opened: false,
                    };
                    state.toolCalls.set(callIndex, entry);
                }
                const fn = isRecord(call.function) ? call.function : {};
                if (!entry.opened) {
                    events.push(formatMessagesEvent('content_block_start', {
                        type: 'content_block_start',
                        index: entry.index,
                        content_block: {
                            type: 'tool_use',
                            id: entry.id,
                            name: typeof fn.name === 'string' ? fn.name : '',
                            input: {},
                        },
                    }));
                    entry.opened = true;
                }
                if (typeof fn.arguments === 'string' && fn.arguments.length > 0) {
                    entry.argBuffer += fn.arguments;
                    events.push(formatMessagesEvent('content_block_delta', {
                        type: 'content_block_delta',
                        index: entry.index,
                        delta: { type: 'input_json_delta', partial_json: fn.arguments },
                    }));
                }
            }
        }
        if (choice.finish_reason) {
            state.stopReason = toAnthropicStopReason(choice.finish_reason);
            if (isRecord(data.usage) && !state.finalUsage) {
                state.finalUsage = toAnthropicUsage(data.usage);
            }
        }
    }
    return events.length > 0 ? events.join('') : null;
}
function nextBlockIndex(state) {
    return state.nextBlockIndexCounter++;
}
function closeThinkingBlock(state, events) {
    if (!state.thinkingOpened || state.thinkingIndex === null)
        return;
    events.push(formatMessagesEvent('content_block_stop', {
        type: 'content_block_stop',
        index: state.thinkingIndex,
    }));
    state.thinkingOpened = false;
}
function closeTextBlock(state, events) {
    if (!state.textOpened || state.textIndex === null)
        return;
    events.push(formatMessagesEvent('content_block_stop', {
        type: 'content_block_stop',
        index: state.textIndex,
    }));
    state.textOpened = false;
}
function hasOpenToolCall(state) {
    for (const entry of state.toolCalls.values()) {
        if (entry.opened)
            return true;
    }
    return false;
}
function closeOpenToolCalls(state, events) {
    for (const entry of state.toolCalls.values()) {
        if (!entry.opened)
            continue;
        events.push(formatMessagesEvent('content_block_stop', {
            type: 'content_block_stop',
            index: entry.index,
        }));
        entry.opened = false;
    }
}
function buildMessageStartEvent(state, data) {
    const usage = isRecord(data.usage) ? toAnthropicUsage(data.usage) : toAnthropicUsage({});
    return formatMessagesEvent('message_start', {
        type: 'message_start',
        message: {
            id: state.messageId,
            type: 'message',
            role: 'assistant',
            model: typeof data.model === 'string' ? data.model : state.model,
            content: [],
            stop_reason: null,
            stop_sequence: null,
            usage,
        },
    });
}
const ANTHROPIC_ERROR_TYPE_BY_STATUS = {
    400: 'invalid_request_error',
    401: 'authentication_error',
    403: 'permission_error',
    404: 'not_found_error',
    429: 'rate_limit_error',
    529: 'overloaded_error',
};
function buildStreamErrorEvent(state, error) {
    state.endedMessage = true;
    const message = typeof error.message === 'string' && error.message
        ? error.message
        : 'Upstream provider stream failed';
    const status = typeof error.status === 'number' ? error.status : undefined;
    const errorType = (status && ANTHROPIC_ERROR_TYPE_BY_STATUS[status]) || 'api_error';
    return formatMessagesEvent('error', {
        type: 'error',
        error: { type: errorType, message },
    });
}
function closeStream(state) {
    if (state.endedMessage)
        return [];
    const events = [];
    closeThinkingBlock(state, events);
    closeTextBlock(state, events);
    closeOpenToolCalls(state, events);
    events.push(formatMessagesEvent('message_delta', {
        type: 'message_delta',
        delta: {
            stop_reason: state.stopReason ?? 'end_turn',
            stop_sequence: null,
        },
        usage: state.finalUsage ?? toAnthropicUsage({}),
    }));
    events.push(formatMessagesEvent('message_stop', { type: 'message_stop' }));
    state.endedMessage = true;
    return events;
}
function extractDataPayloads(chunk) {
    const lines = chunk.split('\n').map((line) => line.trim());
    const dataLines = lines.filter((line) => line.startsWith('data:'));
    if (dataLines.length > 0)
        return dataLines.map((line) => line.slice(5).trim());
    return [chunk.trim()].filter(Boolean);
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
function formatMessagesEvent(event, data) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
//# sourceMappingURL=anthropic-messages-adapter.js.map