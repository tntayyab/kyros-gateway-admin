"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanMessages = scanMessages;
const config_1 = require("./config");
const keyword_trie_1 = require("./keyword-trie");
const text_extractor_1 = require("./text-extractor");
const specificity_detector_1 = require("./specificity-detector");
let defaultTrie = null;
function getDefaultTrie() {
    if (!defaultTrie) {
        const dims = config_1.DEFAULT_CONFIG.dimensions
            .filter((d) => d.keywords && d.keywords.length > 0)
            .map((d) => ({ name: d.name, keywords: d.keywords }));
        defaultTrie = new keyword_trie_1.KeywordTrie(dims);
    }
    return defaultTrie;
}
function scanMessages(messages, tools, headerOverride, recentCategories, categoryPenalties) {
    if (!messages || messages.length === 0)
        return null;
    const extracted = (0, text_extractor_1.extractUserTexts)(messages);
    if (extracted.length === 0)
        return null;
    const lastUserText = extracted[extracted.length - 1].text;
    if (lastUserText.length === 0)
        return null;
    const trie = getDefaultTrie();
    const allMatches = trie.scan(lastUserText);
    return (0, specificity_detector_1.detectSpecificity)(allMatches, tools, headerOverride, undefined, lastUserText, recentCategories, categoryPenalties);
}
//# sourceMappingURL=scan-messages.js.map