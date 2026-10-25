"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUserTexts = extractUserTexts;
exports.countConversationMessages = countConversationMessages;
exports.combinedText = combinedText;
const envelope_peeler_1 = require("./envelope-peeler");
function extractTextFromContent(content) {
    if (content === null || content === undefined)
        return '';
    if (typeof content === 'string')
        return content;
    if (Array.isArray(content)) {
        const parts = [];
        for (const element of content) {
            if (element &&
                typeof element === 'object' &&
                'text' in element &&
                typeof element.text === 'string') {
                parts.push(element.text);
            }
        }
        return parts.join(' ');
    }
    return String(content);
}
const EXCLUDED_ROLES = new Set(['system', 'developer']);
function extractUserTexts(messages) {
    const userMessages = [];
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (EXCLUDED_ROLES.has(msg.role))
            continue;
        if (msg.role !== 'user')
            continue;
        const raw = extractTextFromContent(msg.content);
        if (raw.length === 0)
            continue;
        const text = (0, envelope_peeler_1.peelEnvelope)(raw);
        if (text.length === 0)
            continue;
        userMessages.push({ text, index: i });
    }
    const total = userMessages.length;
    return userMessages.map((um, idx) => {
        const reverseIdx = total - 1 - idx;
        let weight;
        if (reverseIdx === 0)
            weight = 1.0;
        else if (reverseIdx === 1)
            weight = 0.5;
        else
            weight = 0.25;
        return {
            text: um.text,
            positionWeight: weight,
            messageIndex: um.index,
        };
    });
}
function countConversationMessages(messages) {
    let count = 0;
    for (const msg of messages) {
        if (!EXCLUDED_ROLES.has(msg.role))
            count++;
    }
    return count;
}
function combinedText(extracted) {
    return extracted.map((e) => e.text).join('\n');
}
//# sourceMappingURL=text-extractor.js.map