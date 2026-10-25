"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIERS = void 0;
exports.extractToolName = extractToolName;
function extractToolName(tool) {
    if (typeof tool.name === 'string')
        return tool.name;
    const fn = tool.function;
    if (fn && typeof fn.name === 'string')
        return fn.name;
    return null;
}
var manifest_shared_1 = require("manifest-shared");
Object.defineProperty(exports, "TIERS", { enumerable: true, get: function () { return manifest_shared_1.TIERS; } });
//# sourceMappingURL=types.js.map