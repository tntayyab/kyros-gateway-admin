"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRequestRecording = encodeRequestRecording;
exports.decodeRequestRecording = decodeRequestRecording;
const node_util_1 = require("node:util");
const node_zlib_1 = require("node:zlib");
const crypto_util_1 = require("./crypto.util");
const gzipAsync = (0, node_util_1.promisify)(node_zlib_1.gzip);
const gunzipAsync = (0, node_util_1.promisify)(node_zlib_1.gunzip);
const GZIP_MAGIC = Buffer.from([0x1f, 0x8b]);
function isGzip(body) {
    return body.length >= GZIP_MAGIC.length && body.subarray(0, GZIP_MAGIC.length).equals(GZIP_MAGIC);
}
async function encodeRequestRecording(payload) {
    const compressed = await gzipAsync(Buffer.from(JSON.stringify(payload), 'utf8'));
    return (0, crypto_util_1.encryptBuffer)(compressed, (0, crypto_util_1.getEncryptionSecret)());
}
async function decodeRequestRecording(body) {
    let compressed;
    if ((0, crypto_util_1.hasBinaryEnvelope)(body)) {
        compressed = (0, crypto_util_1.decryptBuffer)(body, (0, crypto_util_1.getEncryptionSecret)());
    }
    else if (isGzip(body)) {
        compressed = body;
    }
    else {
        throw new Error('Unrecognized request recording blob: not encrypted and not gzip');
    }
    const payload = JSON.parse((await gunzipAsync(compressed)).toString('utf8'));
    if (payload.version !== 1 ||
        typeof payload.wire_format !== 'string' ||
        !payload.wire_format ||
        !payload.request_body ||
        typeof payload.request_body !== 'object' ||
        !('response_body' in payload)) {
        throw new Error('Invalid request recording object');
    }
    return payload;
}
//# sourceMappingURL=request-recording-codec.js.map