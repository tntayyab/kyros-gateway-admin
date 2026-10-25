"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordTrie = void 0;
exports.isWordCharCode = isWordCharCode;
function createNode() {
    return { children: new Map(), terminals: [] };
}
function isWordCharCode(code) {
    return ((code >= 48 && code <= 57) ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        code === 95);
}
function isWordChar(c) {
    return isWordCharCode(c.charCodeAt(0));
}
class KeywordTrie {
    root = createNode();
    keywordCount = 0;
    constructor(dimensions) {
        for (const dim of dimensions) {
            for (const keyword of dim.keywords) {
                this.insert(keyword.toLowerCase(), keyword.toLowerCase(), dim.name);
            }
        }
    }
    insert(chars, keyword, dimension) {
        let node = this.root;
        for (const ch of chars) {
            let child = node.children.get(ch);
            if (!child) {
                child = createNode();
                node.children.set(ch, child);
            }
            node = child;
        }
        node.terminals.push({ keyword, dimension });
        this.keywordCount++;
    }
    static MAX_SCAN_LENGTH = 100_000;
    scan(text) {
        const matches = [];
        const lower = text.toLowerCase();
        const len = Math.min(lower.length, KeywordTrie.MAX_SCAN_LENGTH);
        for (let i = 0; i < len; i++) {
            if (i > 0 && isWordChar(lower[i - 1]))
                continue;
            let node = this.root;
            for (let j = i; j < len; j++) {
                const child = node.children.get(lower[j]);
                if (!child)
                    break;
                node = child;
                if (node.terminals.length > 0) {
                    const afterIdx = j + 1;
                    if (afterIdx < len && isWordChar(lower[afterIdx]))
                        continue;
                    for (const terminal of node.terminals) {
                        matches.push({
                            keyword: terminal.keyword,
                            dimension: terminal.dimension,
                            position: i,
                        });
                    }
                }
            }
        }
        return matches;
    }
    get size() {
        return this.keywordCount;
    }
}
exports.KeywordTrie = KeywordTrie;
//# sourceMappingURL=keyword-trie.js.map