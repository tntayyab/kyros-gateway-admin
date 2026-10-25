"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutofixRetry = getAutofixRetry;
function getAutofixRetry(autofix) {
    return autofix?.chain.find((entry) => entry.origin === 'autofix');
}
//# sourceMappingURL=autofix.types.js.map