"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropLegacyAutofixRolloutColumns1801600000000 = void 0;
class DropLegacyAutofixRolloutColumns1801600000000 {
    name = 'DropLegacyAutofixRolloutColumns1801600000000';
    async up(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`
        ALTER TABLE "tenants"
          DROP COLUMN IF EXISTS "autofix_waitlist_at",
          DROP COLUMN IF EXISTS "autofix_access_granted_at"
      `);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`
        ALTER TABLE "tenants"
          ADD COLUMN IF NOT EXISTS "autofix_waitlist_at" TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS "autofix_access_granted_at" TIMESTAMP WITH TIME ZONE
      `);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
}
exports.DropLegacyAutofixRolloutColumns1801600000000 = DropLegacyAutofixRolloutColumns1801600000000;
//# sourceMappingURL=1801600000000-DropLegacyAutofixRolloutColumns.js.map