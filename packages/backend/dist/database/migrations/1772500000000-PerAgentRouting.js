"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerAgentRouting1772500000000 = void 0;
class PerAgentRouting1772500000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" ADD COLUMN "agent_id" varchar`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" ADD COLUMN "agent_id" varchar`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_user_provider"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tier_assignments_user_tier"`);
        await queryRunner.query(`
      INSERT INTO "user_providers" ("id", "user_id", "agent_id", "provider", "api_key_encrypted", "is_active", "connected_at", "updated_at")
      SELECT
        gen_random_uuid()::varchar,
        up."user_id",
        a."id",
        up."provider",
        up."api_key_encrypted",
        up."is_active",
        up."connected_at",
        up."updated_at"
      FROM "user_providers" up
      JOIN "tenants" t ON t."name" = up."user_id"
      JOIN "agents" a ON a."tenant_id" = t."id"
      WHERE up."agent_id" IS NULL
    `);
        await queryRunner.query(`
      INSERT INTO "tier_assignments" ("id", "user_id", "agent_id", "tier", "override_model", "auto_assigned_model", "updated_at")
      SELECT
        gen_random_uuid()::varchar,
        ta."user_id",
        a."id",
        ta."tier",
        ta."override_model",
        ta."auto_assigned_model",
        ta."updated_at"
      FROM "tier_assignments" ta
      JOIN "tenants" t ON t."name" = ta."user_id"
      JOIN "agents" a ON a."tenant_id" = t."id"
      WHERE ta."agent_id" IS NULL
    `);
        await queryRunner.query(`DELETE FROM "user_providers" WHERE "agent_id" IS NULL`);
        await queryRunner.query(`DELETE FROM "tier_assignments" WHERE "agent_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "agent_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" ALTER COLUMN "agent_id" SET NOT NULL`);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_providers_agent_provider"
        ON "user_providers" ("agent_id", "provider")
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_tier_assignments_agent_tier"
        ON "tier_assignments" ("agent_id", "tier")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_agent_provider"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tier_assignments_agent_tier"`);
        await queryRunner.query(`
      DELETE FROM "user_providers"
      WHERE "id" NOT IN (
        SELECT MIN("id") FROM "user_providers" GROUP BY "user_id", "provider"
      )
    `);
        await queryRunner.query(`
      DELETE FROM "tier_assignments"
      WHERE "id" NOT IN (
        SELECT MIN("id") FROM "tier_assignments" GROUP BY "user_id", "tier"
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_providers_user_provider"
        ON "user_providers" ("user_id", "provider")
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_tier_assignments_user_tier"
        ON "tier_assignments" ("user_id", "tier")
    `);
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN "agent_id"`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" DROP COLUMN "agent_id"`);
    }
}
exports.PerAgentRouting1772500000000 = PerAgentRouting1772500000000;
//# sourceMappingURL=1772500000000-PerAgentRouting.js.map