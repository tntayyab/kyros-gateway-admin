"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomProviderFkToUserProviders1792100000000 = void 0;
class AddCustomProviderFkToUserProviders1792100000000 {
    name = 'AddCustomProviderFkToUserProviders1792100000000';
    async up(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "user_providers"
      WHERE "provider" LIKE 'custom:%'
        AND NOT EXISTS (
          SELECT 1 FROM "custom_providers" cp
          WHERE cp."id" = substring("user_providers"."provider" FROM 8)
        )
    `);
        await queryRunner.query(`
      ALTER TABLE "user_providers"
        ADD COLUMN "custom_provider_id" varchar
        GENERATED ALWAYS AS (
          CASE WHEN "provider" LIKE 'custom:%' THEN substring("provider" FROM 8) END
        ) STORED
    `);
        await queryRunner.query(`
      ALTER TABLE "user_providers"
        ADD CONSTRAINT "FK_user_providers_custom_provider"
        FOREIGN KEY ("custom_provider_id") REFERENCES "custom_providers"("id")
        ON DELETE CASCADE
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_user_providers_custom_provider_id"
      ON "user_providers" ("custom_provider_id")
      WHERE "custom_provider_id" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_custom_provider_id"`);
        await queryRunner.query(`ALTER TABLE "user_providers" DROP CONSTRAINT IF EXISTS "FK_user_providers_custom_provider"`);
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN IF EXISTS "custom_provider_id"`);
    }
}
exports.AddCustomProviderFkToUserProviders1792100000000 = AddCustomProviderFkToUserProviders1792100000000;
//# sourceMappingURL=1792100000000-AddCustomProviderFkToUserProviders.js.map