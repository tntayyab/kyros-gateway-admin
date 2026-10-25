"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRequestApiMode1801720000000 = void 0;
class AddRequestApiMode1801720000000 {
    name = 'AddRequestApiMode1801720000000';
    async up(queryRunner) {
        await this.withBoundedLockWait(queryRunner, async () => {
            await queryRunner.query(`
        ALTER TABLE "requests"
          ADD COLUMN IF NOT EXISTS "api_mode" character varying
      `);
        });
    }
    async down(queryRunner) {
        await this.withBoundedLockWait(queryRunner, async () => {
            await queryRunner.query(`
        ALTER TABLE "requests"
          DROP COLUMN IF EXISTS "api_mode"
      `);
        });
    }
    async withBoundedLockWait(queryRunner, change) {
        if (queryRunner.isTransactionActive) {
            await queryRunner.query(`SET LOCAL lock_timeout = '5s'`);
            await change();
            return;
        }
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await change();
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
}
exports.AddRequestApiMode1801720000000 = AddRequestApiMode1801720000000;
//# sourceMappingURL=1801720000000-AddRequestApiMode.js.map