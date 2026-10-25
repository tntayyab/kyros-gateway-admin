"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectOpenRouterCacheControl = injectOpenRouterCacheControl;
exports.injectOpenAiMessageCacheControl = injectOpenAiMessageCacheControl;
const CACHE_CONTROL = { type: 'ephemeral' };
function injectCacheControlIntoContent(message) {
    if (typeof message.content === 'string') {
        message.content = [
            {
                type: 'text',
                text: message.content,
                cache_control: CACHE_CONTROL,
            },
        ];
        return true;
    }
    if (!Array.isArray(message.content))
        return false;
    const blocks = message.content;
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];
        if (!block || typeof block !== 'object' || Array.isArray(block))
            continue;
        block.cache_control = CACHE_CONTROL;
        return true;
    }
    return false;
}
function injectOpenRouterCacheControl(body, mode = 'anthropic') {
    const messages = body.messages;
    if (!messages)
        return;
    if (mode === 'message') {
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.role !== 'system' && msg.role !== 'developer' && msg.role !== 'user')
                continue;
            if (injectCacheControlIntoContent(msg))
                return;
        }
        return;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.role !== 'system' && msg.role !== 'developer')
            continue;
        injectCacheControlIntoContent(msg);
        break;
    }
    const tools = body.tools;
    if (tools && tools.length > 0) {
        tools[tools.length - 1].cache_control = CACHE_CONTROL;
    }
}
function injectOpenAiMessageCacheControl(body) {
    injectOpenRouterCacheControl(body, 'message');
}
//# sourceMappingURL=cache-injection.js.map