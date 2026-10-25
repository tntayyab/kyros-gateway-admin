"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.err = err;
exports.result = result;
function ok(payload) {
    return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) ?? 'null' }] };
}
function err(message) {
    return {
        content: [{ type: 'text', text: message }],
        isError: true,
    };
}
function result(promise) {
    return promise.then(ok).catch((e) => err(e instanceof Error ? e.message : String(e)));
}
//# sourceMappingURL=tool-result.js.map