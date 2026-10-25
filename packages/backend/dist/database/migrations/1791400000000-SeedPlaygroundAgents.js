"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedPlaygroundAgents1791400000000 = void 0;
const playground_constants_1 = require("../../common/constants/playground.constants");
class SeedPlaygroundAgents1791400000000 {
    name = 'SeedPlaygroundAgents1791400000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "is_system" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`UPDATE "agents" SET "name" = "name" || '-' || "id"
       WHERE "name" = $1 AND "is_system" = false AND "deleted_at" IS NULL`, [playground_constants_1.PLAYGROUND_AGENT_NAME]);
        await queryRunner.query(`INSERT INTO "agents" ("id", "name", "display_name", "is_system", "is_active", "tenant_id")
       SELECT gen_random_uuid()::text, $1, $1, true, true, t."id"
       FROM "tenants" t
       WHERE NOT EXISTS (
         SELECT 1 FROM "agents" a
         WHERE a."tenant_id" = t."id" AND a."is_system" = true AND a."deleted_at" IS NULL
       )`, [playground_constants_1.PLAYGROUND_AGENT_NAME]);
        await queryRunner.query(`INSERT INTO "agent_provider_access" ("agent_id", "user_provider_id")
       SELECT a."id", up."id"
       FROM "agents" a
       JOIN "tenants" t ON t."id" = a."tenant_id"
       JOIN "user_providers" up ON up."user_id" = t."name"
       WHERE a."is_system" = true AND a."deleted_at" IS NULL
       ON CONFLICT DO NOTHING`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "agents" WHERE "is_system" = true`);
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN IF EXISTS "is_system"`);
    }
}
exports.SeedPlaygroundAgents1791400000000 = SeedPlaygroundAgents1791400000000;
//# sourceMappingURL=1791400000000-SeedPlaygroundAgents.js.map