"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddApiKeyAbsoluteExpiresAt1801740000000 = void 0;
class AddApiKeyAbsoluteExpiresAt1801740000000 {
    name = 'AddApiKeyAbsoluteExpiresAt1801740000000';
    async up(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "absolute_expires_at" TIMESTAMP`);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "absolute_expires_at"`);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
}
exports.AddApiKeyAbsoluteExpiresAt1801740000000 = AddApiKeyAbsoluteExpiresAt1801740000000;
//# sourceMappingURL=1801740000000-AddApiKeyAbsoluteExpiresAt.js.map