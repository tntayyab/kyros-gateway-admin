"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropUserScopeFromRouting1792700000000 = void 0;
class DropUserScopeFromRouting1792700000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_model_params" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`ALTER TABLE "specificity_assignments" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`
      UPDATE "header_tiers" h SET "tenant_id" = a."tenant_id"
      FROM "agents" a WHERE a."id" = h."agent_id" AND h."tenant_id" IS NULL
    `);
        await queryRunner.query(`DELETE FROM "header_tiers" WHERE "tenant_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "header_tiers" ALTER COLUMN "tenant_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "header_tiers" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_rules_user_agent"`);
        await queryRunner.query(`ALTER TABLE "notification_rules" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`ALTER TABLE "oauth_pending_flows" RENAME COLUMN "user_id" TO "tenant_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_oauth_pending_flows_agent_user"`);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_oauth_pending_flows_agent_tenant"
      ON "oauth_pending_flows" ("provider", "agent_id", "tenant_id", "created_at" DESC)
    `);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_playground_runs_user_agent_created"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME COLUMN "user_id" TO "created_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" ALTER COLUMN "created_by_user_id" DROP NOT NULL`);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_playground_runs_tenant_agent_created"
      ON "playground_runs" ("tenant_id", "agent_id", "created_at" DESC)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_oauth_pending_flows_agent_tenant"`);
        await queryRunner.query(`ALTER TABLE "oauth_pending_flows" RENAME COLUMN "tenant_id" TO "user_id"`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_oauth_pending_flows_agent_user" ` +
            `ON "oauth_pending_flows" ("provider", "agent_id", "user_id", "created_at" DESC)`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_playground_runs_tenant_agent_created"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME COLUMN "created_by_user_id" TO "user_id"`);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_playground_runs_user_agent_created"
      ON "playground_runs" ("user_id", "agent_id", "created_at" DESC)
    `);
        await queryRunner.query(`ALTER TABLE "notification_rules" ADD COLUMN IF NOT EXISTS "user_id" varchar`);
        await queryRunner.query(`
      UPDATE "notification_rules" r SET "user_id" = t."owner_user_id"
      FROM "tenants" t WHERE t."id" = r."tenant_id" AND r."user_id" IS NULL
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notification_rules_user_agent"
      ON "notification_rules" ("user_id", "agent_name")
    `);
        await queryRunner.query(`ALTER TABLE "header_tiers" ADD COLUMN IF NOT EXISTS "user_id" varchar`);
        await queryRunner.query(`
      UPDATE "header_tiers" h SET "user_id" = t."owner_user_id"
      FROM "tenants" t WHERE t."id" = h."tenant_id" AND h."user_id" IS NULL
    `);
        await queryRunner.query(`ALTER TABLE "header_tiers" ALTER COLUMN "tenant_id" DROP NOT NULL`);
        for (const table of ['specificity_assignments', 'tier_assignments', 'agent_model_params']) {
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "user_id" varchar`);
            await queryRunner.query(`
        UPDATE "${table}" x SET "user_id" = t."owner_user_id"
        FROM "agents" a
        JOIN "tenants" t ON t."id" = a."tenant_id"
        WHERE a."id" = x."agent_id" AND x."user_id" IS NULL
      `);
        }
    }
}
exports.DropUserScopeFromRouting1792700000000 = DropUserScopeFromRouting1792700000000;
//# sourceMappingURL=1792700000000-DropUserScopeFromRouting.js.map