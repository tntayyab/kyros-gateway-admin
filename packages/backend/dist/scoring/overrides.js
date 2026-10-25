"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasWordBoundaryMatch = hasWordBoundaryMatch;
exports.checkFormalLogicOverride = checkFormalLogicOverride;
exports.estimateTotalTokens = estimateTotalTokens;
const keyword_trie_1 = require("./keyword-trie");
function hasWordBoundaryMatch(text, keyword) {
    const kwLower = keyword.toLowerCase();
    let idx = text.indexOf(kwLower);
    while (idx !== -1) {
        const beforeOk = idx === 0 || !(0, keyword_trie_1.isWordCharCode)(text.charCodeAt(idx - 1));
        const afterEnd = idx + kwLower.length;
        const afterOk = afterEnd >= text.length || !(0, keyword_trie_1.isWordCharCode)(text.charCodeAt(afterEnd));
        if (beforeOk && afterOk)
            return true;
        idx = text.indexOf(kwLower, idx + 1);
    }
    return false;
}
function checkFormalLogicOverride(config, lastUserText) {
    const formalDim = config.dimensions.find((d) => d.name === 'formalLogic');
    if (!formalDim?.keywords || lastUserText.length === 0)
        return false;
    const lastTextLower = lastUserText.toLowerCase();
    for (const kw of formalDim.keywords) {
        if (hasWordBoundaryMatch(lastTextLower, kw))
            return true;
    }
    return false;
}
function estimateTotalTokens(messages) {
    let chars = 0;
    for (const msg of messages) {
        if (msg.content === null || msg.content === undefined)
            continue;
        if (typeof msg.content === 'string') {
            chars += msg.content.length;
        }
        else if (Array.isArray(msg.content)) {
            for (const block of msg.content) {
                if (block &&
                    typeof block === 'object' &&
                    'text' in block &&
                    typeof block.text === 'string') {
                    chars += block.text.length;
                }
            }
        }
        else {
            chars += String(msg.content).length;
        }
    }
    return chars / 4;
}
//# sourceMappingURL=overrides.js.map