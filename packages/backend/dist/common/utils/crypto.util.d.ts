export declare function timingSafeCompare(actual: string, expected: string): boolean;
export declare function getEncryptionSecret(): string;
export declare function getDecryptionSecrets(): string[];
export declare function encrypt(plaintext: string, secret: string): string;
export declare function decrypt(ciphertext: string, secret: string): string;
export declare function decryptWithAny(ciphertext: string, secrets: string[]): {
    plaintext: string;
    secretIndex: number;
};
export declare function isEncrypted(value: string): boolean;
export declare const BINARY_ENVELOPE_MAGIC: Buffer<ArrayBuffer>;
export declare function hasBinaryEnvelope(blob: Buffer): boolean;
export declare function encryptBuffer(plain: Buffer, secret: string): Buffer;
export declare function decryptBuffer(blob: Buffer, secret: string): Buffer;
