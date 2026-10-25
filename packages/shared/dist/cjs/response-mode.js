"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RESPONSE_MODE = exports.RESPONSE_MODES = void 0;
exports.isResponseMode = isResponseMode;
exports.RESPONSE_MODES = ['buffered', 'stream'];
exports.DEFAULT_RESPONSE_MODE = 'buffered';
function isResponseMode(value) {
    return typeof value === 'string' && exports.RESPONSE_MODES.includes(value);
}
//# sourceMappingURL=response-mode.js.map