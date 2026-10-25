"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalPositiveInteger = optionalPositiveInteger;
function optionalPositiveInteger(value) {
    if (!value || !/^\d+$/.test(value))
        return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
//# sourceMappingURL=env.util.js.map