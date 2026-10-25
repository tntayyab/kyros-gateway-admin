"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactInlineImageDataUrls = redactInlineImageDataUrls;
const INLINE_IMAGE_DATA_URL_RE = /^data:(image\/[a-z0-9.+-]+)(?:;[^,]*)?;base64,/i;
function redactInlineImageDataUrls(value) {
    return redactValue(value).value;
}
function redactValue(value) {
    if (typeof value === 'string')
        return redactString(value);
    if (Array.isArray(value))
        return redactArray(value);
    if (!isPlainRecord(value))
        return { value, changed: false };
    const inlineData = inlineImageDataMarker(value);
    const out = {};
    let changed = false;
    for (const [key, nested] of Object.entries(value)) {
        if (inlineData !== null && key === 'data') {
            out[key] = inlineData;
            changed = true;
            continue;
        }
        const result = redactValue(nested);
        out[key] = result.value;
        changed ||= result.changed;
    }
    return changed ? { value: out, changed } : { value, changed: false };
}
function redactArray(values) {
    let changed = false;
    const out = values.map((item) => {
        const result = redactValue(item);
        changed ||= result.changed;
        return result.value;
    });
    return changed ? { value: out, changed } : { value: values, changed: false };
}
function redactString(value) {
    const match = INLINE_IMAGE_DATA_URL_RE.exec(value);
    if (!match)
        return { value, changed: false };
    return { value: describeInlineImage(match[1], value.slice(match[0].length)), changed: true };
}
const INLINE_MIME_KEYS = ['media_type', 'mime_type', 'mimeType'];
function inlineImageDataMarker(value) {
    const data = value['data'];
    if (typeof data !== 'string' || data.length === 0)
        return null;
    const mimeKey = INLINE_MIME_KEYS.find((key) => typeof value[key] === 'string');
    if (!mimeKey)
        return null;
    const mimeType = value[mimeKey];
    if (!/^image\//i.test(mimeType))
        return null;
    return describeInlineImage(mimeType, data);
}
function describeInlineImage(mimeType, base64) {
    const decodedBytes = estimateDecodedBase64Bytes(base64);
    return `[inline image: ${mimeType.toLowerCase()}, ${decodedBytes} bytes, ${base64.length} base64 chars]`;
}
function estimateDecodedBase64Bytes(data) {
    const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.floor((data.length * 3) / 4) - padding);
}
function isPlainRecord(value) {
    return (typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype);
}
//# sourceMappingURL=inline-image-redaction.js.map