"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BINARY_ENVELOPE_MAGIC = void 0;
exports.timingSafeCompare = timingSafeCompare;
exports.getEncryptionSecret = getEncryptionSecret;
exports.getDecryptionSecrets = getDecryptionSecrets;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.decryptWithAny = decryptWithAny;
exports.isEncrypted = isEncrypted;
exports.hasBinaryEnvelope = hasBinaryEnvelope;
exports.encryptBuffer = encryptBuffer;
exports.decryptBuffer = decryptBuffer;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
function timingSafeCompare(actual, expected) {
    const actualBuf = Buffer.from(actual, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');
    if (actualBuf.length !== expectedBuf.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(actualBuf, expectedBuf);
}
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const FINGERPRINT_LENGTH = 16;
const FINGERPRINT_SCRYPT_OPTS = { N: 2, r: 1, p: 1 };
const logger = new common_1.Logger('crypto.util');
let warnedAboutSecretReuse = false;
const keyCache = new Map();
const KEY_CACHE_MAX = 1024;
function deriveKey(secret, salt) {
    const cacheKey = (0, crypto_1.scryptSync)(secret, salt, FINGERPRINT_LENGTH, FINGERPRINT_SCRYPT_OPTS).toString('base64');
    const cached = keyCache.get(cacheKey);
    if (cached)
        return cached;
    const derived = (0, crypto_1.scryptSync)(secret, salt, KEY_LENGTH);
    if (keyCache.size >= KEY_CACHE_MAX) {
        const firstKey = keyCache.keys().next().value;
        if (firstKey)
            keyCache.delete(firstKey);
    }
    keyCache.set(cacheKey, derived);
    return derived;
}
function getEncryptionSecret() {
    const dedicated = process.env['MANIFEST_ENCRYPTION_KEY'];
    if (dedicated && dedicated.length >= 32) {
        return dedicated;
    }
    const sessionSecret = process.env['BETTER_AUTH_SECRET'];
    if (sessionSecret && sessionSecret.length >= 32) {
        if (!warnedAboutSecretReuse && process.env['NODE_ENV'] === 'production') {
            warnedAboutSecretReuse = true;
            logger.warn('MANIFEST_ENCRYPTION_KEY not set — falling back to BETTER_AUTH_SECRET for at-rest ' +
                'encryption. Set MANIFEST_ENCRYPTION_KEY to a separate 32+ char secret so a session-' +
                'signing leak does not also decrypt stored provider/OAuth keys.');
        }
        return sessionSecret;
    }
    throw new Error('Encryption secret required. Set MANIFEST_ENCRYPTION_KEY or BETTER_AUTH_SECRET (>=32 chars).');
}
function getDecryptionSecrets() {
    const secrets = [getEncryptionSecret()];
    const add = (candidate) => {
        if (candidate && candidate.length >= 32 && !secrets.includes(candidate)) {
            secrets.push(candidate);
        }
    };
    add(process.env['MANIFEST_ENCRYPTION_KEY_PREVIOUS']);
    add(process.env['BETTER_AUTH_SECRET']);
    return secrets;
}
function encrypt(plaintext, secret) {
    const salt = (0, crypto_1.randomBytes)(SALT_LENGTH);
    const key = deriveKey(secret, salt);
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [
        salt.toString('base64'),
        iv.toString('base64'),
        tag.toString('base64'),
        encrypted.toString('base64'),
    ].join(':');
}
function decrypt(ciphertext, secret) {
    const parts = ciphertext.split(':');
    if (parts.length !== 4) {
        throw new Error('Invalid ciphertext format');
    }
    const [saltB64, ivB64, tagB64, encryptedB64] = parts;
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(encryptedB64, 'base64');
    const key = deriveKey(secret, salt);
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
function decryptWithAny(ciphertext, secrets) {
    if (secrets.length === 0) {
        throw new Error('No decryption secret available');
    }
    let lastError;
    for (let index = 0; index < secrets.length; index++) {
        try {
            return { plaintext: decrypt(ciphertext, secrets[index]), secretIndex: index };
        }
        catch (err) {
            lastError = err;
        }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
function isEncrypted(value) {
    const parts = value.split(':');
    if (parts.length !== 4)
        return false;
    try {
        for (const part of parts) {
            const buf = Buffer.from(part, 'base64');
            if (buf.toString('base64') !== part)
                return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
exports.BINARY_ENVELOPE_MAGIC = Buffer.from('MRE1', 'ascii');
const BINARY_KDF_SALT = Buffer.from('manifest-recording-envelope-v1', 'utf8');
const TAG_LENGTH = 16;
const BINARY_HEADER_LENGTH = exports.BINARY_ENVELOPE_MAGIC.length + IV_LENGTH + TAG_LENGTH;
function hasBinaryEnvelope(blob) {
    return (blob.length >= exports.BINARY_ENVELOPE_MAGIC.length &&
        blob.subarray(0, exports.BINARY_ENVELOPE_MAGIC.length).equals(exports.BINARY_ENVELOPE_MAGIC));
}
function encryptBuffer(plain, secret) {
    const key = deriveKey(secret, BINARY_KDF_SALT);
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
    return Buffer.concat([exports.BINARY_ENVELOPE_MAGIC, iv, cipher.getAuthTag(), encrypted]);
}
function decryptBuffer(blob, secret) {
    if (!hasBinaryEnvelope(blob) || blob.length < BINARY_HEADER_LENGTH) {
        throw new Error('Invalid encrypted blob format');
    }
    let offset = exports.BINARY_ENVELOPE_MAGIC.length;
    const iv = blob.subarray(offset, (offset += IV_LENGTH));
    const tag = blob.subarray(offset, (offset += TAG_LENGTH));
    const encrypted = blob.subarray(offset);
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, deriveKey(secret, BINARY_KDF_SALT), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
//# sourceMappingURL=crypto.util.js.map