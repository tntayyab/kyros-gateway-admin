"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INSTRUCTIONS = void 0;
exports.convertAssistantToolCalls = convertAssistantToolCalls;
exports.convertTools = convertTools;
exports.convertContent = convertContent;
exports.extractInstructions = extractInstructions;
exports.extractTextContent = extractTextContent;
exports.isObjectRecord = isObjectRecord;
exports.safeParse = safeParse;
exports.formatSSE = formatSSE;
const crypto_1 = require("crypto");
exports.DEFAULT_INSTRUCTIONS = 'You are a helpful assistant.';
function convertAssistantToolCalls(toolCalls) {
    return toolCalls.flatMap((toolCall) => {
        if (!isObjectRecord(toolCall) || !isObjectRecord(toolCall.function))
            return [];
        return [
            {
                type: 'function_call',
                call_id: typeof toolCall.id === 'string' ? toolCall.id : (0, crypto_1.randomUUID)(),
                name: typeof toolCall.function.name === 'string' ? toolCall.function.name : 'unknown',
                arguments: typeof toolCall.function.arguments === 'string' ? toolCall.function.arguments : '{}',
            },
        ];
    });
}
function convertTools(tools) {
    return tools.map((tool) => {
        if (tool.type === 'function' && isObjectRecord(tool.function)) {
            return {
                type: 'function',
                name: tool.function.name,
                ...(tool.function.description !== undefined && { description: tool.function.description }),
                ...(tool.function.parameters !== undefined && { parameters: tool.function.parameters }),
                ...(tool.function.strict !== undefined && { strict: tool.function.strict }),
            };
        }
        return tool;
    });
}
function convertContent(content, role) {
    const partType = role === 'assistant' ? 'output_text' : 'input_text';
    if (content === null || content === undefined) {
        return [{ type: partType, text: '' }];
    }
    if (typeof content === 'string') {
        return [{ type: partType, text: content }];
    }
    if (!Array.isArray(content))
        return content;
    return content.map((part) => {
        if (!isObjectRecord(part))
            return part;
        if (part.type === 'text')
            return { ...part, type: partType };
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
    if (!isObjectRecord(imageUrl) || typeof imageUrl.url !== 'string')
        return null;
    return imageUrl.url;
}
function extractImageDetail(part) {
    const nested = isObjectRecord(part.image_url) ? part.image_url.detail : undefined;
    const detail = typeof part.detail === 'string' ? part.detail : nested;
    return typeof detail === 'string' ? { detail } : {};
}
function extractInstructions(messages) {
    const instructions = messages
        .filter((message) => message.role === 'system' || message.role === 'developer')
        .map((message) => extractTextContent(message.content))
        .filter((content) => Boolean(content))
        .map((content) => content.trim())
        .filter(Boolean)
        .join('\n\n');
    return instructions || exports.DEFAULT_INSTRUCTIONS;
}
function extractTextContent(content) {
    if (typeof content === 'string')
        return content || null;
    if (!Array.isArray(content))
        return null;
    const text = content
        .filter(isObjectRecord)
        .map((part) => {
        if (!isTextPart(part.type) || typeof part.text !== 'string')
            return '';
        return part.text;
    })
        .join('');
    return text || null;
}
function isObjectRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function isTextPart(type) {
    return type === 'text' || type === 'input_text' || type === 'output_text';
}
function safeParse(str) {
    try {
        return JSON.parse(str);
    }
    catch {
        return null;
    }
}
function formatSSE(choice, model, usage) {
    const payload = {
        id: `chatcmpl-${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 29)}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, ...choice }],
    };
    if (usage)
        payload.usage = usage;
    return `data: ${JSON.stringify(payload)}\n\n`;
}
//# sourceMappingURL=chatgpt-helpers.js.map