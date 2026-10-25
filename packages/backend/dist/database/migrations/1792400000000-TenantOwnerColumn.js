"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantOwnerColumn1792400000000 = void 0;
class TenantOwnerColumn1792400000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "owner_user_id" varchar
    `);
        await queryRunner.query(`
      UPDATE "tenants" SET "owner_user_id" = "name" WHERE "owner_user_id" IS NULL
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_tenants_owner_user"
      ON "tenants" ("owner_user_id") WHERE "owner_user_id" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "uq_tenants_owner_user"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "owner_user_id"`);
    }
}
exports.TenantOwnerColumn1792400000000 = TenantOwnerColumn1792400000000;
//# sourceMappingURL=1792400000000-TenantOwnerColumn.js.map