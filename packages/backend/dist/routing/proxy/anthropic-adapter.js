"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMessageCacheControl = hasMessageCacheControl;
exports.applyAnthropicAutomaticCacheControl = applyAnthropicAutomaticCacheControl;
exports.applyAnthropicLastMessageCacheControl = applyAnthropicLastMessageCacheControl;
exports.closeAnthropicObjectSchemas = closeAnthropicObjectSchemas;
exports.toAnthropicRequest = toAnthropicRequest;
exports.extractThinkingBlocksFromMessagesResponse = extractThinkingBlocksFromMessagesResponse;
exports.applyAnthropicMessagesMutations = applyAnthropicMessagesMutations;
exports.fromAnthropicResponse = fromAnthropicResponse;
exports.createAnthropicStreamTransformer = createAnthropicStreamTransformer;
exports.transformAnthropicStreamChunk = transformAnthropicStreamChunk;
const crypto_1 = require("crypto");
const CACHE = { type: 'ephemeral' };
const MAX_CACHE_CONTROL_BLOCKS = 4;
const DATA_IMAGE_URL_RE = /^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/is;
const SUBSCRIPTION_IDENTITY_BLOCK = {
    type: 'text',
    text: "You are a Claude agent, built on Anthropic's Claude Agent SDK.",
};
function safeParseArgs(args) {
    try {
        return JSON.parse(args || '{}');
    }
    catch {
        return {};
    }
}
function isObjectRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function hasMessageCacheControl(body) {
    if (!Array.isArray(body.messages))
        return false;
    return body.messages.some((message) => isObjectRecord(message) &&
        Array.isArray(message.content) &&
        message.content.some((block) => isObjectRecord(block) && block.cache_control !== undefined));
}
function countCacheControlBlocks(value) {
    if (!value || typeof value !== 'object')
        return 0;
    let count = !Array.isArray(value) && 'cache_control' in value ? 1 : 0;
    const children = Array.isArray(value) ? value : Object.values(value);
    for (const child of children)
        count += countCacheControlBlocks(child);
    return count;
}
function hasOneHourCacheControl(value) {
    if (!value || typeof value !== 'object')
        return false;
    if (!Array.isArray(value)) {
        const cacheControl = value.cache_control;
        if (isObjectRecord(cacheControl) && cacheControl.ttl === '1h')
            return true;
    }
    const children = Array.isArray(value) ? value : Object.values(value);
    return children.some(hasOneHourCacheControl);
}
function tryAddCacheControl(block, budget) {
    if (!block || block.cache_control || budget.remaining <= 0)
        return;
    block.cache_control = CACHE;
    budget.remaining -= 1;
}
function applyAnthropicAutomaticCacheControl(body) {
    if (body.cache_control !== undefined)
        return;
    if (countCacheControlBlocks(body) >= MAX_CACHE_CONTROL_BLOCKS)
        return;
    if (hasOneHourCacheControl(body))
        return;
    body.cache_control = CACHE;
}
function isCacheableBlock(block) {
    if (!isObjectRecord(block))
        return false;
    if (block.type === 'thinking' || block.type === 'redacted_thinking')
        return false;
    return block.type !== 'text' || (typeof block.text === 'string' && block.text.length > 0);
}
function applyAnthropicLastMessageCacheControl(body) {
    if (body.cache_control !== undefined || hasOneHourCacheControl(body))
        return;
    const budget = { remaining: MAX_CACHE_CONTROL_BLOCKS - countCacheControlBlocks(body) };
    const messages = body.messages;
    if (budget.remaining <= 0 || !Array.isArray(messages) || messages.length === 0)
        return;
    const last = messages[messages.length - 1];
    if (!isObjectRecord(last))
        return;
    let content;
    if (typeof last.content === 'string') {
        content = [{ type: 'text', text: last.content }];
    }
    else if (Array.isArray(last.content)) {
        content = [...last.content];
    }
    else {
        return;
    }
    let index = content.length - 1;
    while (index >= 0 && !isCacheableBlock(content[index]))
        index -= 1;
    if (index < 0)
        return;
    const block = { ...content[index] };
    tryAddCacheControl(block, budget);
    content[index] = block;
    body.messages = [...messages.slice(0, -1), { ...last, content }];
}
function hasReplayableThinkingSignature(block) {
    return typeof block.signature === 'string' && block.signature.trim().length > 0;
}
function stripUnsignedThinkingBlocks(content) {
    let changed = false;
    const filtered = content.filter((block) => {
        if (block.type !== 'thinking')
            return true;
        if (hasReplayableThinkingSignature(block))
            return true;
        changed = true;
        return false;
    });
    return changed ? { content: filtered, changed } : { content, changed: false };
}
function isTextContentPart(part) {
    return (typeof part.text === 'string' &&
        (part.type === 'text' || part.type === 'input_text' || part.type === 'output_text'));
}
function extractSystemBlocks(messages) {
    const blocks = [];
    for (const msg of messages) {
        if (msg.role !== 'system' && msg.role !== 'developer')
            continue;
        if (typeof msg.content === 'string') {
            blocks.push({ type: 'text', text: msg.content });
        }
        else if (Array.isArray(msg.content)) {
            for (const part of msg.content) {
                if (isObjectRecord(part) && isTextContentPart(part)) {
                    blocks.push({ type: 'text', text: part.text });
                }
            }
        }
    }
    return blocks;
}
function extractOpenAiImageUrl(imageUrl) {
    if (typeof imageUrl === 'string')
        return imageUrl;
    if (!isObjectRecord(imageUrl) || typeof imageUrl.url !== 'string')
        return null;
    return imageUrl.url;
}
function imageUrlToAnthropicBlock(imageUrl) {
    const url = extractOpenAiImageUrl(imageUrl);
    if (!url)
        return null;
    const dataUrl = DATA_IMAGE_URL_RE.exec(url);
    if (dataUrl) {
        const mediaType = dataUrl[1] || 'image/png';
        if (!mediaType.toLowerCase().startsWith('image/'))
            return null;
        return {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: dataUrl[2] },
        };
    }
    return { type: 'image', source: { type: 'url', url } };
}
function normalizeAnthropicImageBlock(part) {
    if (part.type !== 'image' || !isObjectRecord(part.source))
        return null;
    const source = part.source;
    if (source.type === 'base64' && typeof source.data === 'string') {
        const mediaType = typeof source.media_type === 'string' ? source.media_type : 'image/png';
        return { type: 'image', source: { type: 'base64', media_type: mediaType, data: source.data } };
    }
    if (source.type === 'url' && typeof source.url === 'string') {
        return { type: 'image', source: { type: 'url', url: source.url } };
    }
    return null;
}
function toContentBlocks(content, includeImages = false) {
    if (typeof content === 'string')
        return content ? [{ type: 'text', text: content }] : [];
    if (Array.isArray(content)) {
        const blocks = [];
        for (const part of content) {
            if (!isObjectRecord(part))
                continue;
            if (isTextContentPart(part)) {
                blocks.push({ type: 'text', text: part.text });
            }
            else if (includeImages) {
                const imageBlock = part.type === 'image_url'
                    ? imageUrlToAnthropicBlock(part.image_url)
                    : part.type === 'input_image'
                        ? imageUrlToAnthropicBlock(part.image_url)
                        : normalizeAnthropicImageBlock(part);
                if (imageBlock)
                    blocks.push(imageBlock);
            }
        }
        return blocks;
    }
    return [];
}
function convertMessage(msg, thinkingLookup, thinkingRouteContext) {
    if (msg.role === 'system' || msg.role === 'developer')
        return null;
    if (msg.role === 'tool') {
        const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content ?? '');
        return {
            role: 'user',
            content: [
                {
                    type: 'tool_result',
                    tool_use_id: msg.tool_call_id || 'unknown',
                    content: text,
                },
            ],
        };
    }
    if (msg.role === 'assistant') {
        const blocks = [];
        const firstToolCallId = Array.isArray(msg.tool_calls) && msg.tool_calls[0]?.id;
        if (thinkingLookup && typeof firstToolCallId === 'string' && firstToolCallId) {
            const cached = thinkingRouteContext
                ? thinkingLookup(firstToolCallId, thinkingRouteContext)
                : thinkingLookup(firstToolCallId);
            if (cached) {
                for (const block of cached)
                    blocks.push(block);
            }
        }
        blocks.push(...toContentBlocks(msg.content));
        if (Array.isArray(msg.tool_calls)) {
            for (const tc of msg.tool_calls) {
                blocks.push({
                    type: 'tool_use',
                    id: tc.id,
                    name: tc.function.name,
                    input: safeParseArgs(tc.function.arguments),
                });
            }
        }
        return blocks.length > 0 ? { role: 'assistant', content: blocks } : null;
    }
    const blocks = toContentBlocks(msg.content, true);
    return blocks.length > 0 ? { role: 'user', content: blocks } : null;
}
function convertTools(tools) {
    if (!tools || tools.length === 0)
        return undefined;
    const out = [];
    for (const t of tools) {
        const fn = t.function;
        if (fn)
            out.push({ name: fn.name, description: fn.description, input_schema: fn.parameters });
    }
    return out.length > 0 ? out : undefined;
}
function toAnthropicToolChoice(choice, parallelToolCalls) {
    if (choice === 'none')
        return { type: 'none' };
    let out;
    if (choice === 'auto')
        out = { type: 'auto' };
    else if (choice === 'required')
        out = { type: 'any' };
    else if (isObjectRecord(choice) &&
        choice.type === 'function' &&
        isObjectRecord(choice.function) &&
        typeof choice.function.name === 'string') {
        out = { type: 'tool', name: choice.function.name };
    }
    if (parallelToolCalls === false) {
        out = { ...(out ?? { type: 'auto' }), disable_parallel_tool_use: true };
    }
    return out;
}
const ANTHROPIC_SCHEMA_KEYWORDS = new Set([
    'items',
    'contains',
    'additionalProperties',
    'additionalItems',
    'unevaluatedProperties',
    'unevaluatedItems',
    'propertyNames',
    'not',
    'if',
    'then',
    'else',
    'contentSchema',
]);
const ANTHROPIC_SCHEMA_LIST_KEYWORDS = new Set(['allOf', 'anyOf', 'oneOf', 'prefixItems']);
const ANTHROPIC_SCHEMA_MAP_KEYWORDS = new Set([
    'properties',
    'patternProperties',
    '$defs',
    'definitions',
    'dependentSchemas',
    'dependencies',
]);
function closeAnthropicObjectSchemas(schema) {
    if (Array.isArray(schema))
        return schema.map(closeAnthropicObjectSchemas);
    if (!isObjectRecord(schema))
        return schema;
    const entries = [];
    for (const [key, value] of Object.entries(schema)) {
        if (ANTHROPIC_SCHEMA_KEYWORDS.has(key)) {
            entries.push([key, closeAnthropicObjectSchemas(value)]);
        }
        else if (ANTHROPIC_SCHEMA_LIST_KEYWORDS.has(key) && Array.isArray(value)) {
            entries.push([key, value.map(closeAnthropicObjectSchemas)]);
        }
        else if (ANTHROPIC_SCHEMA_MAP_KEYWORDS.has(key) && isObjectRecord(value)) {
            entries.push([
                key,
                Object.fromEntries(Object.entries(value).map(([name, sub]) => [name, closeAnthropicObjectSchemas(sub)])),
            ]);
        }
        else {
            entries.push([key, value]);
        }
    }
    const result = Object.fromEntries(entries);
    const type = result.type;
    const isObjectType = type === 'object' || (Array.isArray(type) && type.some((entry) => entry === 'object'));
    const isObject = isObjectType || (result.properties !== undefined && type === undefined);
    if (isObject && result.additionalProperties === undefined) {
        result.additionalProperties = false;
    }
    return result;
}
function closeOutputConfigObjectSchemas(outputConfig) {
    const format = outputConfig.format;
    if (!isObjectRecord(format) || !('schema' in format))
        return outputConfig;
    return {
        ...outputConfig,
        format: { ...format, schema: closeAnthropicObjectSchemas(format.schema) },
    };
}
function toAnthropicOutputConfig(responseFormat, outputConfig) {
    const out = isObjectRecord(outputConfig) ? { ...outputConfig } : {};
    if (isObjectRecord(responseFormat)) {
        if (responseFormat.type === 'json_object') {
            out.format = { type: 'json_schema', schema: { type: 'object' } };
        }
        else if (responseFormat.type === 'json_schema') {
            const jsonSchema = isObjectRecord(responseFormat.json_schema)
                ? responseFormat.json_schema
                : {};
            out.format = { type: 'json_schema', schema: jsonSchema.schema ?? { type: 'object' } };
        }
    }
    return Object.keys(out).length > 0 ? closeOutputConfigObjectSchemas(out) : undefined;
}
function toAnthropicRequest(body, _model, options) {
    const messages = body.messages || [];
    const systemBlocks = extractSystemBlocks(messages);
    if (systemBlocks.length > 0) {
        systemBlocks[systemBlocks.length - 1].cache_control = CACHE;
    }
    if (options?.injectSubscriptionIdentity) {
        systemBlocks.unshift({ ...SUBSCRIPTION_IDENTITY_BLOCK });
    }
    const thinkingLookup = options?.thinkingLookup;
    const thinkingRouteContext = options?.thinkingRouteContext;
    const converted = messages
        .map((msg) => convertMessage(msg, thinkingLookup, thinkingRouteContext))
        .filter(Boolean);
    const result = {
        messages: converted,
        max_tokens: resolveAnthropicMaxTokens(body),
    };
    if (systemBlocks.length > 0)
        result.system = systemBlocks;
    const tools = convertTools(body.tools) ?? [];
    if (tools.length > 0) {
        tools[tools.length - 1].cache_control = CACHE;
        result.tools = tools;
        const toolChoice = toAnthropicToolChoice(body.tool_choice, body.parallel_tool_calls);
        if (toolChoice)
            result.tool_choice = toolChoice;
    }
    const outputConfig = toAnthropicOutputConfig(body.response_format, body.output_config);
    if (outputConfig) {
        result.output_config = outputConfig;
    }
    if (body.temperature !== undefined)
        result.temperature = body.temperature;
    if (body.top_p !== undefined)
        result.top_p = body.top_p;
    if (body.top_k !== undefined)
        result.top_k = body.top_k;
    if (body.thinking !== undefined) {
        result.thinking = body.thinking;
    }
    if (Array.isArray(body.stop)) {
        result.stop_sequences = body.stop;
    }
    else if (typeof body.stop === 'string' && body.stop) {
        result.stop_sequences = [body.stop];
    }
    return result;
}
function extractThinkingBlocksFromMessagesResponse(body) {
    const content = body.content;
    if (!Array.isArray(content))
        return undefined;
    let firstToolUseId = null;
    const blocks = [];
    for (const block of content) {
        if (block.type === 'thinking' || block.type === 'redacted_thinking') {
            blocks.push(block);
        }
        else if (block.type === 'tool_use' &&
            firstToolUseId === null &&
            typeof block.id === 'string') {
            firstToolUseId = block.id;
        }
    }
    if (blocks.length === 0 || firstToolUseId === null)
        return undefined;
    return { firstToolUseId, blocks };
}
function applyAnthropicMessagesMutations(body, options) {
    const result = { ...body };
    result.max_tokens = resolveAnthropicMaxTokens(body);
    delete result.max_completion_tokens;
    if (isObjectRecord(result.output_config)) {
        result.output_config = closeOutputConfigObjectSchemas(result.output_config);
    }
    const cacheBudget = {
        remaining: hasOneHourCacheControl(body)
            ? 0
            : Math.max(0, MAX_CACHE_CONTROL_BLOCKS - countCacheControlBlocks(body)),
    };
    const needsBlockSystem = options?.injectSubscriptionIdentity ||
        (typeof body.system === 'string' ? body.system : Array.isArray(body.system));
    if (needsBlockSystem) {
        let systemBlocks = [];
        if (typeof body.system === 'string') {
            if (body.system)
                systemBlocks.push({ type: 'text', text: body.system });
        }
        else if (Array.isArray(body.system)) {
            systemBlocks = body.system.map((b) => ({ ...b }));
        }
        tryAddCacheControl(systemBlocks[systemBlocks.length - 1], cacheBudget);
        if (options?.injectSubscriptionIdentity) {
            systemBlocks.unshift({ ...SUBSCRIPTION_IDENTITY_BLOCK });
        }
        if (systemBlocks.length > 0) {
            result.system = systemBlocks;
        }
        else {
            delete result.system;
        }
    }
    if (Array.isArray(body.tools)) {
        const tools = body.tools.map((t) => ({ ...t }));
        tryAddCacheControl(tools[tools.length - 1], cacheBudget);
        result.tools = tools;
    }
    const thinkingLookup = options?.thinkingLookup;
    const thinkingRouteContext = options?.thinkingRouteContext;
    if (Array.isArray(body.messages)) {
        let messagesChanged = false;
        const messages = body.messages
            .map((m) => {
            if (m.role !== 'assistant' || !Array.isArray(m.content))
                return m;
            const sanitized = stripUnsignedThinkingBlocks(m.content);
            const content = sanitized.content;
            const messageChanged = sanitized.changed;
            if (messageChanged && content.length === 0) {
                messagesChanged = true;
                return null;
            }
            const firstToolUse = content.find((b) => b.type === 'tool_use');
            if (!firstToolUse || typeof firstToolUse.id !== 'string' || !thinkingLookup) {
                if (!messageChanged)
                    return m;
                messagesChanged = true;
                return { ...m, content };
            }
            const alreadyHasThinking = content.some((b) => b.type === 'thinking' || b.type === 'redacted_thinking');
            if (alreadyHasThinking) {
                if (!messageChanged)
                    return m;
                messagesChanged = true;
                return { ...m, content };
            }
            const cached = thinkingRouteContext
                ? thinkingLookup(firstToolUse.id, thinkingRouteContext)
                : thinkingLookup(firstToolUse.id);
            if (!cached || cached.length === 0) {
                if (!messageChanged)
                    return m;
                messagesChanged = true;
                return { ...m, content };
            }
            messagesChanged = true;
            return { ...m, content: [...cached, ...content] };
        })
            .filter((m) => m !== null);
        if (messagesChanged)
            result.messages = messages;
    }
    return result;
}
function resolveAnthropicMaxTokens(body) {
    const value = body.max_tokens ?? body.max_completion_tokens;
    return value || 4096;
}
function mapStopReason(reason) {
    if (!reason)
        return 'stop';
    const map = {
        end_turn: 'stop',
        max_tokens: 'length',
        model_context_window_exceeded: 'length',
        tool_use: 'tool_calls',
        stop_sequence: 'stop',
        refusal: 'content_filter',
    };
    return map[reason] ?? 'stop';
}
function fromAnthropicResponse(resp, model) {
    const content = resp.content || [];
    let textContent = '';
    let reasoningContent = '';
    const toolCalls = [];
    const thinkingBlocks = [];
    for (const block of content) {
        if (block.type === 'text' && typeof block.text === 'string')
            textContent += block.text;
        if (block.type === 'thinking' && typeof block.thinking === 'string') {
            reasoningContent += block.thinking;
        }
        if (block.type === 'thinking' || block.type === 'redacted_thinking') {
            thinkingBlocks.push(block);
        }
        if (block.type === 'tool_use') {
            toolCalls.push({
                id: block.id,
                type: 'function',
                function: { name: block.name, arguments: JSON.stringify(block.input ?? {}) },
            });
        }
    }
    const message = { role: 'assistant', content: textContent || null };
    if (reasoningContent)
        message.reasoning_content = reasoningContent;
    if (toolCalls.length > 0)
        message.tool_calls = toolCalls;
    const usage = resp.usage;
    const cacheRead = usage?.cache_read_input_tokens ?? 0;
    const cacheCreation = usage?.cache_creation_input_tokens ?? 0;
    const totalInput = (usage?.input_tokens ?? 0) + cacheRead + cacheCreation;
    const totalOutput = usage?.output_tokens ?? 0;
    const firstToolUseId = toolCalls[0]?.id;
    const extracted = thinkingBlocks.length > 0 && typeof firstToolUseId === 'string'
        ? { firstToolUseId, blocks: thinkingBlocks }
        : undefined;
    return {
        id: `chatcmpl-${(0, crypto_1.randomUUID)()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            { index: 0, message, finish_reason: mapStopReason(resp.stop_reason) },
        ],
        usage: usage
            ? {
                prompt_tokens: totalInput,
                completion_tokens: totalOutput,
                total_tokens: totalInput + totalOutput,
                prompt_tokens_details: { cached_tokens: cacheRead },
                cache_read_tokens: cacheRead,
                cache_creation_tokens: cacheCreation,
            }
            : undefined,
        ...(extracted ? { _extractedThinkingBlocks: extracted } : {}),
    };
}
function makeChunkSse(model, delta, finishReason) {
    return `data: ${JSON.stringify({
        id: `chatcmpl-${(0, crypto_1.randomUUID)()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, delta, finish_reason: finishReason }],
    })}\n\n`;
}
function parseStreamEvent(chunk) {
    if (!chunk.trim())
        return null;
    const lines = chunk.split('\n');
    let eventType = '';
    let jsonPayload = '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('event:'))
            eventType = trimmed.slice(6).trim();
        else if (trimmed)
            jsonPayload = trimmed;
    }
    if (!jsonPayload)
        return null;
    try {
        return { eventType, data: JSON.parse(jsonPayload) };
    }
    catch {
        return null;
    }
}
function makeUsageSse(model, usage) {
    return `data: ${JSON.stringify({
        id: `chatcmpl-${(0, crypto_1.randomUUID)()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [],
        usage,
    })}\n\n`;
}
function handleMessageStart(state, data) {
    const msg = data.message;
    const usage = msg?.usage;
    state.inputTokens = usage?.input_tokens ?? 0;
    state.cacheReadTokens = usage?.cache_read_input_tokens ?? 0;
    state.cacheCreationTokens = usage?.cache_creation_input_tokens ?? 0;
    return makeChunkSse(state.model, { role: 'assistant', content: '' }, null);
}
function applyMessageDeltaUsage(state, usage) {
    if (!usage)
        return;
    if (typeof usage.input_tokens === 'number')
        state.inputTokens = usage.input_tokens;
    if (typeof usage.cache_read_input_tokens === 'number') {
        state.cacheReadTokens = usage.cache_read_input_tokens;
    }
    if (typeof usage.cache_creation_input_tokens === 'number') {
        state.cacheCreationTokens = usage.cache_creation_input_tokens;
    }
}
function handleContentBlockStart(state, data) {
    const block = data.content_block;
    const blockIndex = data.index;
    if (block?.type === 'thinking') {
        state.thinkingBlocksByIndex.set(blockIndex, {
            type: 'thinking',
            thinking: '',
            signature: '',
        });
        return null;
    }
    if (block?.type === 'redacted_thinking') {
        state.thinkingBlocksByIndex.set(blockIndex, { ...block });
        return null;
    }
    if (block?.type === 'tool_use') {
        const idx = state.toolCallIndex++;
        state.blockToToolIndex.set(blockIndex, idx);
        const toolUseId = block.id;
        if (state.firstToolUseId === null && typeof toolUseId === 'string') {
            state.firstToolUseId = toolUseId;
        }
        return makeChunkSse(state.model, {
            tool_calls: [
                {
                    index: idx,
                    id: toolUseId,
                    type: 'function',
                    function: { name: block.name, arguments: '' },
                },
            ],
        }, null);
    }
    return null;
}
function handleContentBlockDelta(state, data) {
    const delta = data.delta;
    if (!delta)
        return null;
    const blockIndex = data.index;
    if (delta.type === 'thinking_delta' && typeof delta.thinking === 'string') {
        const existing = state.thinkingBlocksByIndex.get(blockIndex);
        if (existing) {
            existing.thinking = (existing.thinking || '') + delta.thinking;
        }
        return delta.thinking
            ? makeChunkSse(state.model, { reasoning_content: delta.thinking }, null)
            : null;
    }
    if (delta.type === 'signature_delta' && typeof delta.signature === 'string') {
        const existing = state.thinkingBlocksByIndex.get(blockIndex);
        if (existing) {
            existing.signature = (existing.signature || '') + delta.signature;
        }
        return null;
    }
    if (delta.type === 'text_delta' && typeof delta.text === 'string') {
        return makeChunkSse(state.model, { content: delta.text }, null);
    }
    if (delta.type === 'input_json_delta' && typeof delta.partial_json === 'string') {
        const idx = state.blockToToolIndex.get(blockIndex);
        if (idx !== undefined) {
            return makeChunkSse(state.model, { tool_calls: [{ index: idx, function: { arguments: delta.partial_json } }] }, null);
        }
    }
    return null;
}
function flushThinkingBlocks(state) {
    if (!state.onThinkingBlocks || state.firstToolUseId === null)
        return;
    if (state.thinkingBlocksByIndex.size === 0)
        return;
    const blocks = Array.from(state.thinkingBlocksByIndex.entries())
        .sort(([a], [b]) => a - b)
        .map(([, block]) => ({ ...block }));
    state.onThinkingBlocks(state.firstToolUseId, blocks);
}
function handleMessageDelta(state, data) {
    flushThinkingBlocks(state);
    const delta = data.delta;
    const usage = data.usage;
    applyMessageDeltaUsage(state, usage);
    const outputTokens = typeof usage?.output_tokens === 'number' ? usage.output_tokens : 0;
    const totalInput = state.inputTokens + state.cacheReadTokens + state.cacheCreationTokens;
    const finishChunk = makeChunkSse(state.model, {}, mapStopReason(delta?.stop_reason));
    const usageChunk = makeUsageSse(state.model, {
        prompt_tokens: totalInput,
        completion_tokens: outputTokens,
        total_tokens: totalInput + outputTokens,
        prompt_tokens_details: { cached_tokens: state.cacheReadTokens },
        cache_read_tokens: state.cacheReadTokens,
        cache_creation_tokens: state.cacheCreationTokens,
    });
    return finishChunk + usageChunk;
}
function createAnthropicStreamTransformer(model, onThinkingBlocks) {
    const state = {
        model,
        inputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        toolCallIndex: 0,
        blockToToolIndex: new Map(),
        thinkingBlocksByIndex: new Map(),
        firstToolUseId: null,
        onThinkingBlocks,
    };
    return (chunk) => {
        const parsed = parseStreamEvent(chunk);
        if (!parsed)
            return null;
        const { eventType, data } = parsed;
        const type = eventType || data.type;
        if (type === 'message_start')
            return handleMessageStart(state, data);
        if (type === 'content_block_start')
            return handleContentBlockStart(state, data);
        if (type === 'content_block_delta')
            return handleContentBlockDelta(state, data);
        if (type === 'message_delta')
            return handleMessageDelta(state, data);
        return null;
    };
}
function transformAnthropicStreamChunk(chunk, model) {
    return createAnthropicStreamTransformer(model)(chunk);
}
//# sourceMappingURL=anthropic-adapter.js.map