"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantScopedConfigs1792600000000 = void 0;
class TenantScopedConfigs1792600000000 {
    async rescopeTable(queryRunner, table) {
        await queryRunner.query(`
      ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "tenant_id" varchar
    `);
        await queryRunner.query(`
      UPDATE "${table}" c SET "tenant_id" = t."id"
      FROM "tenants" t
      WHERE t."owner_user_id" = c."user_id" AND c."tenant_id" IS NULL
    `);
        const orphans = await queryRunner.query(`SELECT COUNT(*) AS count FROM "${table}" WHERE "tenant_id" IS NULL`);
        const orphanCount = Number(orphans[0]?.count ?? 0);
        if (orphanCount > 0) {
            if (process.env.MANIFEST_MIGRATION_FORCE === '1') {
                await queryRunner.query(`DELETE FROM "${table}" WHERE "tenant_id" IS NULL`);
            }
            else {
                throw new Error(`TenantScopedConfigs migration: ${orphanCount} ${table} row(s) reference a user ` +
                    `with no tenant and cannot be re-scoped. Inspect them (SELECT * FROM ${table} ` +
                    `WHERE tenant_id IS NULL) or re-run with MANIFEST_MIGRATION_FORCE=1 to delete them.`);
            }
        }
        await queryRunner.query(`
      ALTER TABLE "${table}" ALTER COLUMN "tenant_id" SET NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "${table}" RENAME COLUMN "user_id" TO "created_by_user_id"
    `);
        await queryRunner.query(`
      ALTER TABLE "${table}" ALTER COLUMN "created_by_user_id" DROP NOT NULL
    `);
    }
    async up(queryRunner) {
        await this.rescopeTable(queryRunner, 'email_provider_configs');
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_email_provider_configs_user_id"`);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_email_provider_configs_tenant"
      ON "email_provider_configs" ("tenant_id")
    `);
        await this.rescopeTable(queryRunner, 'api_keys');
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_api_keys_tenant" ON "api_keys" ("tenant_id")
    `);
        await this.rescopeTable(queryRunner, 'custom_providers');
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_custom_providers_user_name"`);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_custom_providers_tenant_name"
      ON "custom_providers" ("tenant_id", LOWER("name"))
    `);
    }
    async restoreUserScope(queryRunner, table) {
        await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "created_by_user_id" TO "user_id"`);
        await queryRunner.query(`
      UPDATE "${table}" c SET "user_id" = t."owner_user_id"
      FROM "tenants" t WHERE t."id" = c."tenant_id" AND c."user_id" IS NULL
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM "${table}" WHERE "user_id" IS NULL) THEN
          ALTER TABLE "${table}" ALTER COLUMN "user_id" SET NOT NULL;
        END IF;
      END $$
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_custom_providers_tenant_name"`);
        await this.restoreUserScope(queryRunner, 'custom_providers');
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_custom_providers_user_name"
      ON "custom_providers" ("user_id", LOWER("name"))
    `);
        await queryRunner.query(`ALTER TABLE "custom_providers" DROP COLUMN IF EXISTS "tenant_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_api_keys_tenant"`);
        await this.restoreUserScope(queryRunner, 'api_keys');
        await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "tenant_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "uq_email_provider_configs_tenant"`);
        await this.restoreUserScope(queryRunner, 'email_provider_configs');
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_email_provider_configs_user_id"
      ON "email_provider_configs" ("user_id")
    `);
        await queryRunner.query(`ALTER TABLE "email_provider_configs" DROP COLUMN IF EXISTS "tenant_id"`);
    }
}
exports.TenantScopedConfigs1792600000000 = TenantScopedConfigs1792600000000;
//# sourceMappingURL=1792600000000-TenantScopedConfigs.js.map