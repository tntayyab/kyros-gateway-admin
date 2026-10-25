"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashKey = hashKey;
exports.verifyKey = verifyKey;
exports.keyPrefix = keyPrefix;
const crypto_1 = require("crypto");
const LEGACY_SALT = 'manifest-api-key-salt';
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
function hashKey(input) {
    const salt = (0, crypto_1.randomBytes)(SALT_LENGTH);
    const hash = (0, crypto_1.scryptSync)(input, salt, KEY_LENGTH);
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
function verifyKey(input, storedHash) {
    if (storedHash.includes(':')) {
        const [saltHex, hashHex] = storedHash.split(':');
        const salt = Buffer.from(saltHex, 'hex');
        const expected = Buffer.from(hashHex, 'hex');
        const actual = (0, crypto_1.scryptSync)(input, salt, KEY_LENGTH);
        return expected.length === KEY_LENGTH && (0, crypto_1.timingSafeEqual)(actual, expected);
    }
    if (!/^[0-9a-fA-F]{64}$/.test(storedHash))
        return false;
    const legacyHashBuf = (0, crypto_1.scryptSync)(input, LEGACY_SALT, KEY_LENGTH);
    const storedBuf = Buffer.from(storedHash, 'hex');
    return (0, crypto_1.timingSafeEqual)(legacyHashBuf, storedBuf);
}
function keyPrefix(key) {
    return key.substring(0, 12);
}
//# sourceMappingURL=hash.util.js.map