"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePkce = generatePkce;
exports.generateState = generateState;
const crypto_1 = require("crypto");
function generatePkce() {
    const verifier = (0, crypto_1.randomBytes)(32).toString('base64url');
    const challenge = (0, crypto_1.createHash)('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
}
function generateState(byteLength = 32) {
    return (0, crypto_1.randomBytes)(byteLength).toString('hex');
}
//# sourceMappingURL=pkce.js.map