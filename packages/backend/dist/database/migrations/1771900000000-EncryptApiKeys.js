"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptApiKeys1771900000000 = void 0;
const crypto_util_1 = require("../../common/utils/crypto.util");
class EncryptApiKeys1771900000000 {
    name = 'EncryptApiKeys1771900000000';
    async up(queryRunner) {
        const log = queryRunner.connection.logger;
        const secret = process.env['MANIFEST_ENCRYPTION_KEY'] || process.env['BETTER_AUTH_SECRET'];
        if (!secret || secret.length < 32) {
            log.log('warn', 'EncryptApiKeys: No encryption secret found. Skipping — set MANIFEST_ENCRYPTION_KEY or BETTER_AUTH_SECRET.');
            return;
        }
        const tableExists = await queryRunner.query(`SELECT 1 FROM information_schema.tables WHERE table_name = 'user_providers'`);
        if (tableExists.length === 0)
            return;
        const rows = await queryRunner.query(`SELECT id, api_key_encrypted FROM "user_providers" WHERE api_key_encrypted IS NOT NULL AND api_key_encrypted != ''`);
        let encrypted = 0;
        for (const row of rows) {
            if ((0, crypto_util_1.isEncrypted)(row.api_key_encrypted))
                continue;
            const ciphertext = (0, crypto_util_1.encrypt)(row.api_key_encrypted, secret);
            await queryRunner.query(`UPDATE "user_providers" SET api_key_encrypted = $1 WHERE id = $2`, [
                ciphertext,
                row.id,
            ]);
            encrypted++;
        }
        if (encrypted > 0) {
            log.log('info', `EncryptApiKeys: Encrypted ${encrypted} plaintext API key(s).`);
        }
    }
    async down() {
    }
}
exports.EncryptApiKeys1771900000000 = EncryptApiKeys1771900000000;
//# sourceMappingURL=1771900000000-EncryptApiKeys.js.map