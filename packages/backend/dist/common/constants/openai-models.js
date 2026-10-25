"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_RESPONSES_ONLY_RE = void 0;
exports.stripVendorPrefix = stripVendorPrefix;
exports.OPENAI_RESPONSES_ONLY_RE = /(?:-codex(?!-mini-latest)|^gpt-5[^/]*-pro(?:-|$)|^o1-pro|^o\d(?:-mini)?-deep-research(?:-|$))/i;
function stripVendorPrefix(model) {
    const slashIdx = model.indexOf('/');
    return slashIdx > 0 ? model.substring(slashIdx + 1) : model;
}
//# sourceMappingURL=openai-models.js.map