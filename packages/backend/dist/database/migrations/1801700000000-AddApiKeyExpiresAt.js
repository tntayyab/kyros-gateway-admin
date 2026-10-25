"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddApiKeyExpiresAt1801700000000 = void 0;
class AddApiKeyExpiresAt1801700000000 {
    name = 'AddApiKeyExpiresAt1801700000000';
    async up(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP`);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "expires_at"`);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
}
exports.AddApiKeyExpiresAt1801700000000 = AddApiKeyExpiresAt1801700000000;
//# sourceMappingURL=1801700000000-AddApiKeyExpiresAt.js.map