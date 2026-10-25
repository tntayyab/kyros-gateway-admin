"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABSOLUTE_TIME_THRESHOLD_MS = void 0;
exports.toAbsoluteExpiryTimestamp = toAbsoluteExpiryTimestamp;
exports.toPollIntervalMs = toPollIntervalMs;
exports.ABSOLUTE_TIME_THRESHOLD_MS = 10_000_000_000;
function toAbsoluteExpiryTimestamp(expiresIn) {
    if (expiresIn > exports.ABSOLUTE_TIME_THRESHOLD_MS)
        return expiresIn;
    return Date.now() + expiresIn * 1000;
}
function toPollIntervalMs(interval, defaultMs) {
    if (!interval || interval <= 0)
        return defaultMs;
    return interval >= 1000 ? interval : interval * 1000;
}
//# sourceMappingURL=device-flow.js.map