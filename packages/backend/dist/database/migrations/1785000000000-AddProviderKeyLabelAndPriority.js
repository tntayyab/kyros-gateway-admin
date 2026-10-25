"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProviderKeyLabelAndPriority1785000000000 = void 0;
class AddProviderKeyLabelAndPriority1785000000000 {
    name = 'AddProviderKeyLabelAndPriority1785000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" ADD COLUMN IF NOT EXISTS "label" varchar`);
        await queryRunner.query(`ALTER TABLE "user_providers" ADD COLUMN IF NOT EXISTS "priority" integer`);
        await queryRunner.query(`UPDATE "user_providers" SET "label" = 'Default' WHERE "label" IS NULL`);
        await queryRunner.query(`UPDATE "user_providers" SET "priority" = 0 WHERE "priority" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "label" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "priority" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "priority" SET DEFAULT 0`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_agent_provider_auth"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_providers_agent_provider_auth_label" ` +
            `ON "user_providers" ("agent_id", "provider", "auth_type", LOWER("label"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_agent_provider_auth_label"`);
        await queryRunner.query(`DELETE FROM "user_providers" a USING "user_providers" b ` +
            `WHERE a.agent_id = b.agent_id ` +
            `AND a.provider = b.provider ` +
            `AND a.auth_type = b.auth_type ` +
            `AND a.priority > b.priority`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_providers_agent_provider_auth" ` +
            `ON "user_providers" ("agent_id", "provider", "auth_type")`);
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN IF EXISTS "priority"`);
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN IF EXISTS "label"`);
    }
}
exports.AddProviderKeyLabelAndPriority1785000000000 = AddProviderKeyLabelAndPriority1785000000000;
//# sourceMappingURL=1785000000000-AddProviderKeyLabelAndPriority.js.map