"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldCompress = shouldCompress;
const compression_1 = __importDefault(require("compression"));
function contentTypeOf(res) {
    const raw = res.getHeader('Content-Type');
    if (Array.isArray(raw))
        return (raw[0] ?? '').toLowerCase();
    return String(raw ?? '').toLowerCase();
}
function shouldCompress(req, res, defaultFilter = compression_1.default.filter) {
    if (contentTypeOf(res).startsWith('text/event-stream')) {
        return false;
    }
    return defaultFilter(req, res);
}
//# sourceMappingURL=compression-filter.js.map