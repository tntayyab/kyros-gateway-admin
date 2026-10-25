"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGoogleRequest = toGoogleRequest;
exports.fromGoogleResponse = fromGoogleResponse;
exports.createGoogleStreamState = createGoogleStreamState;
exports.transformGoogleStreamChunk = transformGoogleStreamChunk;
exports.finishGoogleStream = finishGoogleStream;
const crypto_1 = require("crypto");
const DATA_IMAGE_URL_RE = /^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/is;
const UNSUPPORTED_SCHEMA_FIELDS = new Set([
    'patternProperties',
    'propertyNames',
    'additionalProperties',
    'additionalItems',
    'prefixItems',
    'uniqueItems',
    'multipleOf',
    'contains',
    'minContains',
    'maxContains',
    '$schema',
    '$id',
    '$ref',
    'ref',
    '$defs',
    'definitions',
    'allOf',
    'anyOf',
    'oneOf',
    'not',
    'if',
    'then',
    'else',
    'dependentSchemas',
    'dependentRequired',
    'unevaluatedProperties',
    'unevaluatedItems',
    'contentMediaType',
    'contentEncoding',
    'examples',
    'default',
    'const',
    'title',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'readOnly',
    'writeOnly',
    'deprecated',
    '$comment',
    '$anchor',
    '$dynamicRef',
    '$dynamicAnchor',
    '$vocabulary',
]);
function sanitizeSchema(schema, isPropertiesMap = false) {
    if (schema === null || schema === undefined || typeof schema !== 'object') {
        return schema;
    }
    if (Array.isArray(schema)) {
        return schema.map((item) => sanitizeSchema(item));
    }
    const result = {};
    for (const [key, value] of Object.entries(schema)) {
        if (!isPropertiesMap && UNSUPPORTED_SCHEMA_FIELDS.has(key))
            continue;
        if (key === 'type' && Array.isArray(value)) {
            const types = value.filter((item) => typeof item === 'string');
            const nonNullTypes = types.filter((item) => item !== 'null');
            if (nonNullTypes.length > 0) {
                result.type = nonNullTypes[0];
            }
            if (types.includes('null'))
                result.nullable = true;
            continue;
        }
        result[key] = sanitizeSchema(value, key === 'properties');
    }
    return result;
}
function safeParseArgs(args) {
    try {
        return JSON.parse(args || '{}');
    }
    catch {
        return {};
    }
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function cloneRecord(value) {
    return JSON.parse(JSON.stringify(value));
}
function mapRole(role) {
    if (role === 'assistant')
        return 'model';
    if (role === 'system')
        return 'user';
    return 'user';
}
function extractImageUrl(imageUrl) {
    if (typeof imageUrl === 'string')
        return imageUrl;
    if (!isRecord(imageUrl) || typeof imageUrl.url !== 'string')
        return null;
    return imageUrl.url;
}
function imageUrlToGooglePart(imageUrl) {
    const url = extractImageUrl(imageUrl);
    if (!url)
        return null;
    const dataUrl = DATA_IMAGE_URL_RE.exec(url);
    if (dataUrl) {
        const mimeType = dataUrl[1] || 'image/png';
        if (!mimeType.toLowerCase().startsWith('image/'))
            return null;
        return { inlineData: { mimeType, data: dataUrl[2] } };
    }
    return { fileData: { fileUri: url } };
}
function buildToolCallNameMap(messages) {
    const map = new Map();
    for (const msg of messages) {
        if (msg.role !== 'assistant' || !Array.isArray(msg.tool_calls))
            continue;
        for (const tc of msg.tool_calls) {
            if (tc && typeof tc.id === 'string' && tc.function?.name) {
                map.set(tc.id, tc.function.name);
            }
        }
    }
    return map;
}
function messageToContent(msg, toolNamesById, signatureLookup) {
    const parts = [];
    if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
    }
    else if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
            if (typeof block.text === 'string' &&
                (block.type === 'text' || block.type === 'input_text' || block.type === 'output_text')) {
                parts.push({ text: block.text });
            }
            else if (block.type === 'image_url' || block.type === 'input_image') {
                const imagePart = imageUrlToGooglePart(block.image_url);
                if (imagePart)
                    parts.push(imagePart);
            }
        }
    }
    if (Array.isArray(msg.tool_calls)) {
        for (const tc of msg.tool_calls) {
            const functionCall = {
                name: tc.function.name,
                args: safeParseArgs(tc.function.arguments),
            };
            const hasId = typeof tc.id === 'string' && tc.id !== '';
            if (hasId)
                functionCall.id = tc.id;
            const part = { functionCall };
            const echoed = tc.thought_signature;
            const cached = hasId && signatureLookup ? signatureLookup(tc.id) : null;
            const signature = typeof echoed === 'string' && echoed !== '' ? echoed : cached;
            part.thoughtSignature =
                typeof signature === 'string' && signature !== ''
                    ? signature
                    : 'context_engineering_is_the_way_to_go';
            parts.push(part);
        }
    }
    if (msg.role === 'tool' && typeof msg.content === 'string') {
        const toolCallId = msg.tool_call_id || '';
        const functionName = toolNamesById.get(toolCallId) || 'unknown';
        const functionResponse = {
            name: functionName,
            response: { result: msg.content },
        };
        if (toolCallId)
            functionResponse.id = toolCallId;
        return { role: 'user', parts: [{ functionResponse }] };
    }
    if (parts.length === 0)
        return null;
    return { role: mapRole(msg.role), parts };
}
function convertTools(tools) {
    if (!tools || tools.length === 0)
        return undefined;
    const declarations = tools
        .map((t) => {
        const fn = t.function;
        if (!fn)
            return null;
        return {
            name: fn.name,
            description: fn.description,
            parameters: fn.parameters ? sanitizeSchema(fn.parameters) : undefined,
        };
    })
        .filter(Boolean);
    if (declarations.length === 0)
        return undefined;
    return [{ functionDeclarations: declarations }];
}
function toGoogleToolConfig(choice) {
    let functionCallingConfig;
    if (choice === 'auto')
        functionCallingConfig = { mode: 'AUTO' };
    else if (choice === 'none')
        functionCallingConfig = { mode: 'NONE' };
    else if (choice === 'required')
        functionCallingConfig = { mode: 'ANY' };
    else if (isRecord(choice) &&
        choice.type === 'function' &&
        isRecord(choice.function) &&
        typeof choice.function.name === 'string') {
        functionCallingConfig = { mode: 'ANY', allowedFunctionNames: [choice.function.name] };
    }
    return functionCallingConfig ? { functionCallingConfig } : undefined;
}
function applyResponseFormatToGenerationConfig(genConfig, responseFormat) {
    if (!isRecord(responseFormat))
        return;
    if (responseFormat.type === 'json_object') {
        genConfig.responseMimeType = 'application/json';
        delete genConfig.responseSchema;
        return;
    }
    if (responseFormat.type !== 'json_schema')
        return;
    genConfig.responseMimeType = 'application/json';
    const jsonSchema = isRecord(responseFormat.json_schema) ? responseFormat.json_schema : null;
    if (!jsonSchema || jsonSchema.schema === undefined) {
        delete genConfig.responseSchema;
        return;
    }
    genConfig.responseSchema = sanitizeSchema(jsonSchema.schema);
}
function systemContentText(content) {
    if (typeof content === 'string')
        return content;
    if (!Array.isArray(content))
        return '';
    return content
        .filter((part) => isRecord(part) &&
        typeof part.text === 'string' &&
        (part.type === 'text' || part.type === 'input_text'))
        .map((part) => part.text)
        .join('\n');
}
function toGoogleRequest(body, _model, signatureLookup) {
    const messages = body.messages || [];
    const contents = [];
    const toolNamesById = buildToolCallNameMap(messages);
    const isSystem = (m) => m.role === 'system' || m.role === 'developer';
    const systemMsgs = messages.filter(isSystem);
    const systemText = systemMsgs
        .map((m) => systemContentText(m.content))
        .filter(Boolean)
        .join('\n');
    for (const msg of messages) {
        if (isSystem(msg))
            continue;
        const content = messageToContent(msg, toolNamesById, signatureLookup);
        if (content)
            contents.push(content);
    }
    const merged = [];
    for (const content of contents) {
        const prev = merged[merged.length - 1];
        const allFunctionResponses = content.role === 'user' && content.parts.every((p) => p.functionResponse);
        if (allFunctionResponses &&
            prev &&
            prev.role === 'user' &&
            prev.parts.every((p) => p.functionResponse)) {
            prev.parts.push(...content.parts);
        }
        else {
            merged.push(content);
        }
    }
    const result = { contents: merged };
    if (systemText) {
        result.systemInstruction = {
            parts: [{ text: systemText }],
        };
    }
    const tools = convertTools(body.tools);
    if (tools) {
        result.tools = tools;
        const toolConfig = toGoogleToolConfig(body.tool_choice);
        if (toolConfig)
            result.toolConfig = toolConfig;
    }
    const genConfig = isRecord(body.generationConfig)
        ? cloneRecord(body.generationConfig)
        : {};
    const maxTokens = body.max_tokens ?? body.max_completion_tokens;
    if (maxTokens !== undefined)
        genConfig.maxOutputTokens = maxTokens;
    if (body.temperature !== undefined)
        genConfig.temperature = body.temperature;
    if (body.top_p !== undefined)
        genConfig.topP = body.top_p;
    if (Array.isArray(body.stop) && body.stop.length > 0) {
        genConfig.stopSequences = body.stop;
    }
    else if (typeof body.stop === 'string' && body.stop) {
        genConfig.stopSequences = [body.stop];
    }
    else if (Array.isArray(body.stop) || body.stop === '') {
        delete genConfig.stopSequences;
    }
    applyResponseFormatToGenerationConfig(genConfig, body.response_format);
    if (Object.keys(genConfig).length > 0)
        result.generationConfig = genConfig;
    return result;
}
function fromGoogleResponse(googleResp, model) {
    const candidates = googleResp.candidates || [];
    const candidate = candidates[0];
    if (!candidate) {
        return {
            id: `chatcmpl-${(0, crypto_1.randomUUID)()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [],
        };
    }
    const content = candidate.content;
    const parts = content?.parts || [];
    let textContent = '';
    const toolCalls = [];
    const extractedSignatures = [];
    for (const part of parts) {
        if (part.text && !part.thought)
            textContent += part.text;
        if (part.functionCall) {
            const fc = part.functionCall;
            const toolCallId = typeof fc.id === 'string' && fc.id ? fc.id : `call_${(0, crypto_1.randomUUID)()}`;
            const toolCall = {
                id: toolCallId,
                type: 'function',
                function: { name: fc.name, arguments: JSON.stringify(fc.args) },
            };
            const sig = part.thoughtSignature;
            if (typeof sig === 'string' && sig) {
                toolCall.thought_signature = sig;
                extractedSignatures.push({ toolCallId, signature: sig });
            }
            toolCalls.push(toolCall);
        }
    }
    const message = { role: 'assistant', content: textContent || null };
    if (toolCalls.length > 0)
        message.tool_calls = toolCalls;
    const usage = googleResp.usageMetadata;
    return {
        id: `chatcmpl-${(0, crypto_1.randomUUID)()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            { index: 0, message, finish_reason: mapFinishReason(candidate, toolCalls.length > 0) },
        ],
        usage: usage ? toChatUsage(usage) : undefined,
        ...(extractedSignatures.length > 0 ? { _extractedSignatures: extractedSignatures } : {}),
    };
}
function toChatUsage(usage) {
    const reasoningTokens = usage.thoughtsTokenCount ?? 0;
    const cachedTokens = usage.cachedContentTokenCount ?? 0;
    return {
        prompt_tokens: usage.promptTokenCount ?? 0,
        completion_tokens: (usage.candidatesTokenCount ?? 0) + reasoningTokens,
        total_tokens: usage.totalTokenCount ?? 0,
        prompt_tokens_details: { cached_tokens: cachedTokens },
        completion_tokens_details: { reasoning_tokens: reasoningTokens },
        cache_read_tokens: cachedTokens,
        cache_creation_tokens: 0,
    };
}
function mapFinishReason(candidate, hasToolCalls = false) {
    const reason = candidate.finishReason;
    if (!reason || reason === 'STOP') {
        return hasToolCalls ? 'tool_calls' : 'stop';
    }
    const map = {
        MAX_TOKENS: 'length',
        SAFETY: 'content_filter',
        RECITATION: 'content_filter',
    };
    return map[reason] ?? 'stop';
}
function createGoogleStreamState() {
    return {
        id: `chatcmpl-${(0, crypto_1.randomUUID)()}`,
        created: Math.floor(Date.now() / 1000),
        toolCallCount: 0,
        finished: false,
        usageSent: false,
    };
}
function transformGoogleStreamChunk(chunk, model, state = createGoogleStreamState()) {
    const empty = { chunk: null, signatures: [] };
    if (!chunk.trim())
        return empty;
    let data;
    try {
        data = JSON.parse(chunk);
    }
    catch {
        return empty;
    }
    const candidates = data.candidates || [];
    const candidate = candidates[0];
    const content = candidate?.content;
    const parts = content?.parts || [];
    const text = parts
        .filter((p) => !p.thought)
        .map((p) => p.text || '')
        .join('');
    const toolCalls = [];
    const signatures = [];
    for (const part of parts) {
        if (part.functionCall) {
            const fc = part.functionCall;
            const toolCallId = typeof fc.id === 'string' && fc.id ? fc.id : `call_${(0, crypto_1.randomUUID)()}`;
            const toolCall = {
                index: state.toolCallCount++,
                id: toolCallId,
                type: 'function',
                function: { name: fc.name, arguments: JSON.stringify(fc.args ?? {}) },
            };
            const sig = part.thoughtSignature;
            if (typeof sig === 'string' && sig) {
                toolCall.thought_signature = sig;
                signatures.push({ toolCallId, signature: sig });
            }
            toolCalls.push(toolCall);
        }
    }
    let result = '';
    if (text || toolCalls.length > 0) {
        const delta = {};
        if (text)
            delta.content = text;
        if (toolCalls.length > 0)
            delta.tool_calls = toolCalls;
        result += `data: ${JSON.stringify({
            id: state.id,
            object: 'chat.completion.chunk',
            created: state.created,
            model,
            choices: [{ index: 0, delta, finish_reason: null }],
        })}\n\n`;
    }
    const usage = data.usageMetadata;
    if (usage)
        state.usage = usage;
    const isTerminal = Boolean(candidate?.finishReason) || (Boolean(usage) && !candidate);
    if (isTerminal) {
        if (!state.finished) {
            state.finished = true;
            const finishReason = mapFinishReason(candidate ?? {}, state.toolCallCount > 0);
            result += `data: ${JSON.stringify({
                id: state.id,
                object: 'chat.completion.chunk',
                created: state.created,
                model,
                choices: [{ index: 0, delta: {}, finish_reason: finishReason }],
            })}\n\n`;
        }
        if (state.usage && !state.usageSent) {
            state.usageSent = true;
            result += usageChunk(state, state.usage, model);
        }
    }
    return { chunk: result || null, signatures };
}
function usageChunk(state, usage, model) {
    return `data: ${JSON.stringify({
        id: state.id,
        object: 'chat.completion.chunk',
        created: state.created,
        model,
        choices: [],
        usage: toChatUsage(usage),
    })}\n\n`;
}
function finishGoogleStream(state, model) {
    if (state.usageSent || !state.usage)
        return null;
    state.usageSent = true;
    return usageChunk(state, state.usage, model);
}
//# sourceMappingURL=google-adapter.js.map