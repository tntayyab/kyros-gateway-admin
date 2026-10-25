"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KiroEventStreamParser = exports.KIRO_CHAT_TARGET = exports.KIRO_MODELS_TARGET = exports.KIRO_BASE_URL = void 0;
exports.buildKiroHeaders = buildKiroHeaders;
exports.toKiroModelId = toKiroModelId;
exports.parseKiroModels = parseKiroModels;
exports.buildKiroChatRequest = buildKiroChatRequest;
exports.estimateKiroPromptTokens = estimateKiroPromptTokens;
exports.createKiroOpenAiStream = createKiroOpenAiStream;
exports.forwardKiroChat = forwardKiroChat;
const node_buffer_1 = require("node:buffer");
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
exports.KIRO_BASE_URL = 'https://q.us-east-1.amazonaws.com';
exports.KIRO_MODELS_TARGET = 'AmazonCodeWhispererService.ListAvailableModels';
exports.KIRO_CHAT_TARGET = 'AmazonCodeWhispererStreamingService.GenerateAssistantResponse';
const logger = new common_1.Logger('KiroAdapter');
const KIRO_ORIGIN = 'KIRO_CLI';
const KIRO_AGENT_MODE = 'SUPERVISED';
const DEFAULT_KIRO_CONTEXT_WINDOW = 200000;
const AUTO_KIRO_CONTEXT_WINDOW = 1000000;
const KIRO_ESTIMATED_CHARS_PER_TOKEN = 4;
const IGNORED_KIRO_EVENT_TYPES = new Set([
    'initial-response',
    'meteringevent',
    'messagestopevent',
    'metricsevent',
    'codereferenceevent',
    'supplementaryweblinksevent',
]);
const KIRO_TOOL_NAME_MAX_LENGTH = 64;
const KIRO_TOOL_DESCRIPTION_MAX_LENGTH = 10237;
const KIRO_TOOL_ID_MAX_LENGTH = 64;
const KIRO_TOOL_NAME_ILLEGAL = /[^a-zA-Z0-9_-]/g;
const KIRO_TOOL_NAME_ALLOWED = /^[a-zA-Z0-9_-]$/;
const KIRO_TOOL_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
function buildKiroHeaders(apiKey, target) {
    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/x-amz-json-1.0',
        'x-amz-target': target,
    };
}
function toKiroModelId(model) {
    return model.replace(/^kiro\//i, '');
}
function formatKiroModelId(modelId) {
    return modelId.toLowerCase().startsWith('kiro/') ? modelId : `kiro/${modelId}`;
}
function readNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function readKiroContextWindow(entry, modelId) {
    const tokenLimits = (entry.tokenLimits ?? entry.token_limits);
    return (readNumber(entry.contextWindowTokens) ??
        readNumber(entry.context_window_tokens) ??
        readNumber(tokenLimits?.contextWindowTokens) ??
        readNumber(tokenLimits?.context_window_tokens) ??
        readNumber(tokenLimits?.maxInputTokens) ??
        readNumber(tokenLimits?.max_input_tokens) ??
        (modelId === 'auto' ? AUTO_KIRO_CONTEXT_WINDOW : DEFAULT_KIRO_CONTEXT_WINDOW));
}
function parseKiroModels(body, provider = 'kiro') {
    const models = body?.models;
    if (!Array.isArray(models))
        return [];
    return models
        .map((raw) => raw)
        .filter((entry) => typeof (entry.modelId ?? entry.model_id) === 'string')
        .map((entry) => {
        const rawId = String(entry.modelId ?? entry.model_id);
        const id = formatKiroModelId(rawId);
        const displayName = String(entry.modelName ?? entry.model_name ?? rawId);
        return {
            id,
            displayName,
            provider,
            contextWindow: readKiroContextWindow(entry, rawId),
            inputPricePerToken: 0,
            outputPricePerToken: 0,
            capabilityReasoning: false,
            capabilityCode: true,
            capabilities: ['tools'],
            qualityScore: 3,
        };
    });
}
function stringifyContent(content) {
    if (typeof content === 'string')
        return content;
    if (content == null)
        return '';
    if (Array.isArray(content)) {
        return content
            .map((part) => {
            if (typeof part === 'string')
                return part;
            if (!part || typeof part !== 'object')
                return '';
            const record = part;
            if (typeof record.text === 'string')
                return record.text;
            if (record.type === 'image_url' || record.type === 'input_image')
                return '[image omitted]';
            return '';
        })
            .filter(Boolean)
            .join('\n');
    }
    try {
        return JSON.stringify(content);
    }
    catch {
        return String(content);
    }
}
function appendText(current, extra) {
    if (!extra)
        return current;
    return current ? `${current}\n\n${extra}` : extra;
}
function trimToLength(value, max) {
    return [...value].slice(0, max).join('');
}
function isUserMessage(message) {
    return 'userInputMessage' in message;
}
function isAssistantMessage(message) {
    return 'assistantResponseMessage' in message;
}
function toUserMessage(content, options = {}) {
    const context = options.toolResults?.length
        ? { toolResults: options.toolResults }
        : undefined;
    return {
        userInputMessage: {
            content,
            origin: KIRO_ORIGIN,
            ...(options.modelId ? { modelId: options.modelId } : {}),
            ...(context ? { userInputMessageContext: context } : {}),
        },
    };
}
function toAssistantMessage(content, toolUses) {
    return {
        assistantResponseMessage: {
            content,
            ...(toolUses && toolUses.length > 0 ? { toolUses } : {}),
        },
    };
}
function cleanSchemaValue(value) {
    if (Array.isArray(value))
        return value.map(cleanSchemaValue);
    if (!value || typeof value !== 'object')
        return value;
    const cleaned = {};
    for (const [key, child] of Object.entries(value)) {
        if (key === 'additionalProperties')
            continue;
        if (key === 'required' && Array.isArray(child) && child.length === 0)
            continue;
        cleaned[key] = cleanSchemaValue(child);
    }
    return cleaned;
}
function normalizeToolSchema(schema) {
    const cleaned = schema && typeof schema === 'object' && !Array.isArray(schema)
        ? cleanSchemaValue(schema)
        : {};
    cleaned.type = 'object';
    if (!cleaned.properties ||
        typeof cleaned.properties !== 'object' ||
        Array.isArray(cleaned.properties)) {
        cleaned.properties = {};
    }
    if (Array.isArray(cleaned.required)) {
        const properties = new Set(Object.keys(cleaned.properties));
        const required = [
            ...new Set(cleaned.required.filter((name) => typeof name === 'string' && properties.has(name))),
        ];
        if (required.length === 0)
            delete cleaned.required;
        else
            cleaned.required = required;
    }
    return cleaned;
}
function sanitizeToolName(rawName) {
    const chars = [];
    let previousUnderscore = false;
    for (const char of rawName.trim()) {
        const sanitized = KIRO_TOOL_NAME_ALLOWED.test(char) ? char : '_';
        if (sanitized === '_') {
            if (previousUnderscore)
                continue;
            previousUnderscore = true;
        }
        else {
            previousUnderscore = false;
        }
        chars.push(sanitized);
    }
    let start = 0;
    let end = chars.length;
    while (start < end && chars[start] === '_')
        start += 1;
    while (end > start && chars[end - 1] === '_')
        end -= 1;
    return chars.slice(start, end).join('');
}
function uniqueToolName(rawName, used) {
    const base = trimToLength(sanitizeToolName(rawName) || 'tool', KIRO_TOOL_NAME_MAX_LENGTH);
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
        const tail = `_${suffix}`;
        suffix += 1;
        candidate = `${base.slice(0, KIRO_TOOL_NAME_MAX_LENGTH - tail.length)}${tail}`;
    }
    used.add(candidate);
    return candidate;
}
function buildKiroToolSpecs(tools) {
    const specs = [];
    const toKiroName = new Map();
    const toolNameMap = new Map();
    const used = new Set();
    if (!Array.isArray(tools))
        return { specs, toKiroName, toolNameMap };
    for (const raw of tools) {
        if (!raw || typeof raw !== 'object')
            continue;
        const tool = raw;
        const fn = (tool.function ?? {});
        const rawName = fn.name ?? tool.name;
        if (typeof rawName !== 'string' || !rawName.trim())
            continue;
        if (toKiroName.has(rawName))
            continue;
        const name = uniqueToolName(rawName, used);
        toKiroName.set(rawName, name);
        if (name !== rawName)
            toolNameMap.set(name, rawName);
        const rawDescription = fn.description ?? tool.description;
        const description = trimToLength(typeof rawDescription === 'string' && rawDescription.trim()
            ? rawDescription
            : `Tool: ${rawName}`, KIRO_TOOL_DESCRIPTION_MAX_LENGTH);
        const schema = fn.parameters ?? tool.parameters ?? tool.input_schema;
        specs.push({
            toolSpecification: { name, description, inputSchema: { json: normalizeToolSchema(schema) } },
        });
    }
    return { specs, toKiroName, toolNameMap };
}
function parseToolInput(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
        }
        catch {
        }
    }
    return {};
}
function toolUsesFromAssistant(message, toKiroName) {
    if (!Array.isArray(message.tool_calls))
        return [];
    const uses = [];
    message.tool_calls.forEach((raw, index) => {
        if (!raw || typeof raw !== 'object')
            return;
        const call = raw;
        const name = call.function?.name;
        if (typeof name !== 'string' || !name)
            return;
        uses.push({
            toolUseId: typeof call.id === 'string' && call.id ? call.id : `call_${index + 1}`,
            name: toKiroName.get(name) ?? name,
            input: parseToolInput(call.function?.arguments),
        });
    });
    return uses;
}
function toolResultFromMessage(message) {
    return {
        toolUseId: typeof message.tool_call_id === 'string' ? message.tool_call_id : '',
        status: 'success',
        content: [{ text: stringifyContent(message.content) }],
    };
}
function buildKiroTurns(messages, toKiroName) {
    const turns = [];
    let user = null;
    let assistant = null;
    const flushUser = () => {
        if (user) {
            turns.push(user);
            user = null;
        }
    };
    const flushAssistant = () => {
        if (assistant) {
            turns.push(assistant);
            assistant = null;
        }
    };
    for (const message of messages) {
        if (message.role === 'system' || message.role === 'developer')
            continue;
        if (message.role === 'assistant') {
            flushUser();
            const content = stringifyContent(message.content);
            const toolUses = toolUsesFromAssistant(message, toKiroName);
            if (!content && toolUses.length === 0)
                continue;
            if (assistant) {
                assistant.assistantResponseMessage.content = appendText(assistant.assistantResponseMessage.content, content);
                if (toolUses.length > 0) {
                    assistant.assistantResponseMessage.toolUses = [
                        ...(assistant.assistantResponseMessage.toolUses ?? []),
                        ...toolUses,
                    ];
                }
            }
            else {
                assistant = toAssistantMessage(content || '...', toolUses);
            }
            continue;
        }
        flushAssistant();
        const result = message.role === 'tool' ? toolResultFromMessage(message) : null;
        const content = result ? '' : stringifyContent(message.content);
        if (user) {
            user.userInputMessage.content = appendText(user.userInputMessage.content, content);
            if (result) {
                const context = (user.userInputMessage.userInputMessageContext ??= {});
                context.toolResults = [...(context.toolResults ?? []), result];
            }
        }
        else {
            user = toUserMessage(content, { toolResults: result ? [result] : undefined });
        }
    }
    flushAssistant();
    flushUser();
    return turns;
}
function flattenToolUse(toolUse) {
    return `[Tool call: ${toolUse.name}(${JSON.stringify(toolUse.input)})]`;
}
function flattenToolResult(result) {
    const text = result.content.map((part) => part.text).join('\n');
    return `[Tool result${result.status === 'error' ? ' (error)' : ''}: ${text}]`;
}
function deleteEmptyContext(message) {
    const context = message.userInputMessage.userInputMessageContext;
    if (!context)
        return;
    if (!context.toolResults?.length)
        delete context.toolResults;
    if (!context.tools?.length)
        delete context.tools;
    if (Object.keys(context).length === 0)
        delete message.userInputMessage.userInputMessageContext;
}
function reserveToolUseId(rawId, fallback, used) {
    const sanitized = rawId.replace(KIRO_TOOL_NAME_ILLEGAL, '');
    const base = trimToLength(KIRO_TOOL_ID_PATTERN.test(sanitized) && sanitized ? sanitized : fallback, KIRO_TOOL_ID_MAX_LENGTH);
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
        const tail = `_${suffix}`;
        suffix += 1;
        candidate = `${base.slice(0, KIRO_TOOL_ID_MAX_LENGTH - tail.length)}${tail}`;
    }
    used.add(candidate);
    return candidate;
}
function reconcileToolPairs(turns, specNames) {
    const usedIds = new Set();
    for (let index = 0; index < turns.length - 1; index += 1) {
        const assistant = turns[index];
        const user = turns[index + 1];
        if (!isAssistantMessage(assistant) || !isUserMessage(user))
            continue;
        const calls = assistant.assistantResponseMessage.toolUses ?? [];
        const context = user.userInputMessage.userInputMessageContext;
        const results = context?.toolResults ?? [];
        if (calls.length === 0) {
            if (results.length > 0) {
                user.userInputMessage.content = appendText(user.userInputMessage.content, results.map(flattenToolResult).join('\n\n'));
                if (context)
                    delete context.toolResults;
                deleteEmptyContext(user);
            }
            continue;
        }
        const resultQueues = new Map();
        for (const result of results) {
            const queue = resultQueues.get(result.toolUseId) ?? [];
            queue.push(result);
            resultQueues.set(result.toolUseId, queue);
        }
        const keptCalls = [];
        const keptResults = [];
        const flattened = [];
        for (const call of calls) {
            const result = resultQueues.get(call.toolUseId)?.shift();
            if (result && specNames.has(call.name)) {
                const toolUseId = reserveToolUseId(call.toolUseId, `call_${index}_${keptCalls.length}`, usedIds);
                keptCalls.push({ ...call, toolUseId });
                keptResults.push({ ...result, toolUseId });
            }
            else {
                flattened.push(flattenToolUse(call));
                if (result)
                    flattened.push(flattenToolResult(result));
            }
        }
        for (const queue of resultQueues.values()) {
            for (const result of queue)
                flattened.push(flattenToolResult(result));
        }
        if (flattened.length > 0) {
            user.userInputMessage.content = appendText(user.userInputMessage.content, flattened.join('\n\n'));
        }
        if (keptCalls.length > 0)
            assistant.assistantResponseMessage.toolUses = keptCalls;
        else
            delete assistant.assistantResponseMessage.toolUses;
        if (context && keptResults.length > 0)
            context.toolResults = keptResults;
        else if (context)
            delete context.toolResults;
        deleteEmptyContext(user);
    }
}
function finalizeKiroConversation(turns, specs, model) {
    const working = [...turns];
    if (working.length === 0) {
        working.push(toUserMessage('continue', { modelId: model }));
    }
    if (isAssistantMessage(working[0])) {
        working.unshift(toUserMessage('continue'));
    }
    if (isAssistantMessage(working[working.length - 1])) {
        working.push(toUserMessage('continue'));
    }
    reconcileToolPairs(working, new Set(specs.map((spec) => spec.toolSpecification.name)));
    let currentIndex = working.length - 1;
    while (currentIndex >= 0 && !isUserMessage(working[currentIndex]))
        currentIndex -= 1;
    const currentMessage = working[currentIndex];
    return { history: working.slice(0, currentIndex), currentMessage };
}
function buildKiroConversation(body, model) {
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const systemText = messages
        .filter((message) => message.role === 'system' || message.role === 'developer')
        .map((message) => stringifyContent(message.content))
        .filter(Boolean)
        .join('\n\n');
    const { specs, toKiroName, toolNameMap } = buildKiroToolSpecs(body.tools);
    const { history, currentMessage } = finalizeKiroConversation(buildKiroTurns(messages, toKiroName), specs, model);
    if (specs.length > 0) {
        const context = (currentMessage.userInputMessage.userInputMessageContext ??= {});
        context.tools = specs;
    }
    const currentText = currentMessage.userInputMessage.content;
    const toolResults = currentMessage.userInputMessage.userInputMessageContext?.toolResults ?? [];
    const hasToolResults = toolResults.length > 0;
    if (hasToolResults && !currentText) {
        currentMessage.userInputMessage.content = '';
        const firstUser = history.find(isUserMessage);
        if (firstUser) {
            if (systemText) {
                firstUser.userInputMessage.content = `System instructions:\n${systemText}\n\nUser:\n${firstUser.userInputMessage.content}`;
            }
        }
        else {
            const context = currentMessage.userInputMessage.userInputMessageContext;
            const inlined = toolResults.map(flattenToolResult).join('\n\n');
            currentMessage.userInputMessage.content = systemText
                ? `System instructions:\n${systemText}\n\nUser:\n${inlined}`
                : inlined;
            delete context.toolResults;
            deleteEmptyContext(currentMessage);
        }
    }
    else {
        currentMessage.userInputMessage.content = systemText
            ? `System instructions:\n${systemText}\n\nUser:\n${currentText || 'Hello'}`
            : currentText || 'Hello';
    }
    currentMessage.userInputMessage.modelId ??= model;
    return {
        body: {
            conversationState: {
                conversationId: (0, node_crypto_1.randomUUID)(),
                history,
                currentMessage,
                chatTriggerType: 'MANUAL',
            },
            agentMode: KIRO_AGENT_MODE,
        },
        toolNameMap,
    };
}
function buildKiroChatRequest(body, model) {
    return buildKiroConversation(body, model).body;
}
function parseEventHeaders(buffer) {
    const headers = {};
    let offset = 0;
    while (offset < buffer.length) {
        const nameLength = buffer.readUInt8(offset);
        offset += 1;
        const name = buffer.toString('utf8', offset, offset + nameLength);
        offset += nameLength;
        const type = buffer.readUInt8(offset);
        offset += 1;
        if (type === 0 || type === 1) {
            headers[name] = type === 0;
        }
        else if (type === 2) {
            headers[name] = buffer.readInt8(offset);
            offset += 1;
        }
        else if (type === 3) {
            headers[name] = buffer.readInt16BE(offset);
            offset += 2;
        }
        else if (type === 4) {
            headers[name] = buffer.readInt32BE(offset);
            offset += 4;
        }
        else if (type === 5) {
            headers[name] = buffer.readBigInt64BE(offset);
            offset += 8;
        }
        else if (type === 6) {
            const valueLength = buffer.readUInt16BE(offset);
            offset += 2;
            headers[name] = node_buffer_1.Buffer.from(buffer.subarray(offset, offset + valueLength));
            offset += valueLength;
        }
        else if (type === 7) {
            const valueLength = buffer.readUInt16BE(offset);
            offset += 2;
            headers[name] = buffer.toString('utf8', offset, offset + valueLength);
            offset += valueLength;
        }
        else if (type === 8) {
            headers[name] = new Date(Number(buffer.readBigInt64BE(offset)));
            offset += 8;
        }
        else if (type === 9) {
            const value = buffer.subarray(offset, offset + 16).toString('hex');
            headers[name] = `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
            offset += 16;
        }
        else {
            break;
        }
    }
    return headers;
}
class KiroEventStreamParser {
    pending = node_buffer_1.Buffer.alloc(0);
    push(chunk) {
        this.pending = node_buffer_1.Buffer.concat([this.pending, node_buffer_1.Buffer.from(chunk)]);
        const events = [];
        while (this.pending.length >= 12) {
            const totalLength = this.pending.readUInt32BE(0);
            const headersLength = this.pending.readUInt32BE(4);
            if (totalLength < 16 || headersLength > totalLength - 16) {
                throw new Error('Invalid Kiro event stream frame');
            }
            if (this.pending.length < totalLength)
                break;
            const frame = this.pending.subarray(0, totalLength);
            this.pending = this.pending.subarray(totalLength);
            const headersStart = 12;
            const payloadStart = headersStart + headersLength;
            const payloadEnd = totalLength - 4;
            const headers = parseEventHeaders(frame.subarray(headersStart, payloadStart));
            const payloadBytes = frame.subarray(payloadStart, payloadEnd);
            const payloadText = payloadBytes.toString('utf8');
            const payload = payloadText ? JSON.parse(payloadText) : null;
            events.push({
                eventType: typeof headers[':event-type'] === 'string' ? headers[':event-type'] : undefined,
                messageType: typeof headers[':message-type'] === 'string' ? headers[':message-type'] : undefined,
                payload,
            });
        }
        return events;
    }
    finish() {
        if (this.pending.length > 0)
            throw new Error('Truncated Kiro event stream');
    }
}
exports.KiroEventStreamParser = KiroEventStreamParser;
function createKiroCollectState() {
    return { content: '', reasoning: '', toolCalls: new Map(), toolOrder: [] };
}
function eventPayload(event) {
    const payload = event.payload;
    if (!payload || typeof payload !== 'object')
        return {};
    const record = payload;
    if (event.eventType && record[event.eventType] && typeof record[event.eventType] === 'object') {
        return record[event.eventType];
    }
    return record;
}
function numberField(record, ...keys) {
    for (const key of keys) {
        const value = readNumber(record[key]);
        if (value !== undefined)
            return value;
    }
    return 0;
}
function normalizeUsage(value) {
    if (!value || typeof value !== 'object')
        return undefined;
    const usage = value;
    const uncachedInput = numberField(usage, 'uncachedInputTokens', 'uncached_input_tokens');
    const cacheRead = numberField(usage, 'cacheReadInputTokens', 'cache_read_input_tokens', 'cached_tokens');
    const cacheWrite = numberField(usage, 'cacheWriteInputTokens', 'cache_write_input_tokens', 'cache_creation_input_tokens');
    const prompt = numberField(usage, 'prompt_tokens', 'inputTokens', 'input_tokens') ||
        uncachedInput + cacheRead + cacheWrite;
    const completion = numberField(usage, 'completion_tokens', 'outputTokens', 'output_tokens');
    const total = numberField(usage, 'total_tokens', 'totalTokens') || prompt + completion;
    return {
        prompt_tokens: prompt,
        completion_tokens: completion,
        total_tokens: total,
        ...(cacheRead > 0 ? { cache_read_tokens: cacheRead } : {}),
        ...(cacheWrite > 0 ? { cache_creation_tokens: cacheWrite } : {}),
        ...(cacheRead > 0 || cacheWrite > 0
            ? {
                prompt_tokens_details: {
                    cached_tokens: cacheRead,
                    cache_write_tokens: cacheWrite,
                },
            }
            : {}),
    };
}
function estimateTokensFromText(text) {
    if (!text)
        return 0;
    return Math.ceil(text.length / KIRO_ESTIMATED_CHARS_PER_TOKEN);
}
function kiroCompletionText(state) {
    const parts = [state.content, state.reasoning];
    for (const id of state.toolOrder) {
        const tool = state.toolCalls.get(id);
        parts.push(tool.name, tool.input);
    }
    return parts.filter(Boolean).join('\n');
}
const KIRO_NON_PROMPT_KEYS = new Set([
    'conversationid',
    'modelid',
    'chattriggertype',
    'agentmode',
    'origin',
    'status',
    'tooluseid',
]);
function collectKiroStrings(value, out) {
    if (typeof value === 'string') {
        out.push(value);
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value)
            collectKiroStrings(item, out);
        return;
    }
    if (value && typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) {
            if (!KIRO_NON_PROMPT_KEYS.has(key.toLowerCase()))
                collectKiroStrings(item, out);
        }
    }
}
function estimateKiroPromptTokens(conversation) {
    const parts = [];
    collectKiroStrings(conversation, parts);
    return estimateTokensFromText(parts.join('\n'));
}
function resolveKiroUsage(state, promptTokens) {
    if (state.usage)
        return state.usage;
    const completionText = estimateTokensFromText(kiroCompletionText(state));
    if (promptTokens <= 0 && completionText <= 0)
        return undefined;
    return {
        prompt_tokens: promptTokens,
        completion_tokens: completionText,
        total_tokens: promptTokens + completionText,
        estimated: true,
    };
}
function extractErrorMessage(event) {
    const payload = eventPayload(event);
    const message = payload.message ?? payload.errorMessage ?? payload.error;
    return typeof message === 'string' ? message : null;
}
function collectKiroToolUse(state, payload) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    if (!name)
        return;
    const rawId = typeof payload.toolUseId === 'string' ? payload.toolUseId : '';
    const id = rawId || `call_${state.toolOrder.length + 1}`;
    let tool = state.toolCalls.get(id);
    if (!tool) {
        tool = { id, name, input: '' };
        state.toolCalls.set(id, tool);
        state.toolOrder.push(id);
    }
    const input = payload.input;
    if (typeof input === 'string') {
        tool.input += input;
    }
    else if (input && typeof input === 'object') {
        tool.input = JSON.stringify(input);
    }
}
function applyKiroEvent(state, event) {
    const eventType = event.eventType?.toLowerCase() ?? '';
    const payload = eventPayload(event);
    if (event.messageType === 'exception') {
        throw new Error(extractErrorMessage(event) ?? 'Kiro returned an exception event');
    }
    if (eventType.includes('assistantresponse')) {
        const content = typeof payload.content === 'string' ? payload.content : '';
        state.content += content;
        return content ? { content } : null;
    }
    if (eventType.includes('reasoningcontent')) {
        const text = typeof payload.text === 'string' ? payload.text : '';
        state.reasoning += text;
        return text ? { reasoning_content: text } : null;
    }
    if (eventType.includes('tooluse')) {
        const values = Array.isArray(payload) ? payload : [payload];
        for (const value of values) {
            if (value && typeof value === 'object') {
                collectKiroToolUse(state, value);
            }
        }
        return null;
    }
    if (eventType.includes('metadata') || eventType.includes('contextusage')) {
        const tokenUsage = payload.tokenUsage ?? payload.token_usage;
        if (tokenUsage)
            state.usage = normalizeUsage(tokenUsage);
        return null;
    }
    if (event.eventType && !IGNORED_KIRO_EVENT_TYPES.has(eventType)) {
        logger.debug(`Unhandled Kiro event type: ${event.eventType}`);
    }
    return null;
}
function kiroToolCalls(state, toolNameMap) {
    return state.toolOrder.map((id) => {
        const tool = state.toolCalls.get(id);
        return {
            id: tool.id,
            name: toolNameMap?.get(tool.name) ?? tool.name,
            arguments: tool.input.trim() || '{}',
        };
    });
}
function openAiChunk(model, delta, finishReason = null, usage) {
    return `data: ${JSON.stringify({
        id: `chatcmpl-${(0, node_crypto_1.randomUUID)()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, delta, finish_reason: finishReason }],
        ...(usage ? { usage } : {}),
    })}\n\n`;
}
function createKiroOpenAiStream(source, model, toolNameMap, promptTokens = 0) {
    const encoder = new TextEncoder();
    const parser = new KiroEventStreamParser();
    const state = createKiroCollectState();
    return new ReadableStream({
        async start(controller) {
            const reader = source.getReader();
            try {
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    for (const event of parser.push(value)) {
                        const delta = applyKiroEvent(state, event);
                        if (delta)
                            controller.enqueue(encoder.encode(openAiChunk(model, delta)));
                    }
                }
                parser.finish();
                const toolCalls = kiroToolCalls(state, toolNameMap);
                toolCalls.forEach((tool, index) => {
                    controller.enqueue(encoder.encode(openAiChunk(model, {
                        tool_calls: [
                            {
                                index,
                                id: tool.id,
                                type: 'function',
                                function: { name: tool.name, arguments: tool.arguments },
                            },
                        ],
                    })));
                });
                const finishReason = toolCalls.length > 0 ? 'tool_calls' : 'stop';
                controller.enqueue(encoder.encode(openAiChunk(model, {}, finishReason, resolveKiroUsage(state, promptTokens))));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            }
            catch (err) {
                controller.error(err);
            }
        },
    });
}
async function collectKiroCompletion(source, model, promptTokens, toolNameMap) {
    const parser = new KiroEventStreamParser();
    const state = createKiroCollectState();
    const reader = source.getReader();
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            break;
        for (const event of parser.push(value)) {
            applyKiroEvent(state, event);
        }
    }
    parser.finish();
    const message = {
        role: 'assistant',
        content: state.content,
    };
    if (state.reasoning)
        message.reasoning_content = state.reasoning;
    const toolCalls = kiroToolCalls(state, toolNameMap);
    if (toolCalls.length > 0) {
        message.tool_calls = toolCalls.map((tool) => ({
            id: tool.id,
            type: 'function',
            function: { name: tool.name, arguments: tool.arguments },
        }));
    }
    const usage = resolveKiroUsage(state, promptTokens);
    return {
        id: `chatcmpl-${(0, node_crypto_1.randomUUID)()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            {
                index: 0,
                message,
                finish_reason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
            },
        ],
        usage,
    };
}
async function forwardKiroChat(opts) {
    const timeoutSignal = AbortSignal.timeout(opts.timeoutMs);
    const fetchSignal = opts.signal ? AbortSignal.any([timeoutSignal, opts.signal]) : timeoutSignal;
    const headers = {
        ...buildKiroHeaders(opts.apiKey, exports.KIRO_CHAT_TARGET),
        'x-amzn-kiro-agent-mode': KIRO_AGENT_MODE,
        ...opts.extraHeaders,
    };
    const { body, toolNameMap } = buildKiroConversation(opts.body, opts.model);
    const promptTokens = estimateKiroPromptTokens(body);
    const upstream = await fetch(exports.KIRO_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: fetchSignal,
        redirect: 'error',
    });
    if (!upstream.ok || !upstream.body)
        return upstream;
    if (opts.stream) {
        return new Response(createKiroOpenAiStream(upstream.body, opts.model, toolNameMap, promptTokens), {
            status: 200,
            headers: { 'Content-Type': 'text/event-stream' },
        });
    }
    const completion = await collectKiroCompletion(upstream.body, opts.model, promptTokens, toolNameMap);
    return new Response(JSON.stringify(completion), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
//# sourceMappingURL=kiro-adapter.js.map