"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSignalBoosts = computeSignalBoosts;
const types_1 = require("./types");
const URL_REGEX = /\bhttps?:\/\/[^\s)"']+/i;
const BARE_HOST_REGEX = /\b[a-z0-9][a-z0-9-]*\.(com|org|net|io|dev|app|co|gov|edu|ai)\b/i;
const URL_BOOST = 2;
const BARE_HOST_BOOST = 1;
const CODE_FENCE_REGEX = /```[a-z+_-]*\n[\s\S]{40,}?\n?```/i;
const FILE_PATH_REGEX = /(?:^|\s)(?:\.?\/\w|src\/|packages\/|app\/|lib\/|components\/|pages\/|[\w-]+\.(?:ts|tsx|js|jsx|py|go|rs|rb|java|kt|swift|php|cs|cpp|c|h|hpp|sh|sql|yaml|yml|json|toml|md|html|css|scss)\b)/i;
const STACK_TRACE_REGEX = /\b(?:TypeError|ReferenceError|SyntaxError|Traceback|at \w+\.\w+\s*\()/;
const CODING_TOOL_NAMES = new Set([
    'str_replace',
    'str_replace_editor',
    'apply_patch',
    'multiedit',
    'notebookedit',
]);
const CODE_FENCE_BOOST = 3;
const FILE_PATH_BOOST = 2;
const STACK_TRACE_BOOST = 3;
const CODING_TOOL_BOOST = 1;
function computeSignalBoosts(text, tools) {
    const boosts = new Map();
    const add = (cat, v) => boosts.set(cat, (boosts.get(cat) ?? 0) + v);
    if (URL_REGEX.test(text)) {
        add('web_browsing', URL_BOOST);
    }
    else if (BARE_HOST_REGEX.test(text)) {
        add('web_browsing', BARE_HOST_BOOST);
    }
    if (CODE_FENCE_REGEX.test(text))
        add('coding', CODE_FENCE_BOOST);
    if (FILE_PATH_REGEX.test(text))
        add('coding', FILE_PATH_BOOST);
    if (STACK_TRACE_REGEX.test(text))
        add('coding', STACK_TRACE_BOOST);
    if (tools) {
        for (const t of tools) {
            const name = (0, types_1.extractToolName)(t);
            if (name && CODING_TOOL_NAMES.has(name.toLowerCase())) {
                add('coding', CODING_TOOL_BOOST);
                break;
            }
        }
    }
    return { boosts };
}
//# sourceMappingURL=specificity-signals.js.map