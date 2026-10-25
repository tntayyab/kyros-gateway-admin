"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddComplexityRoutingFlag1777100000000 = void 0;
class AddComplexityRoutingFlag1777100000000 {
    name = 'AddComplexityRoutingFlag1777100000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN "complexity_routing_enabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`UPDATE "agents" SET "complexity_routing_enabled" = true`);
        await queryRunner.query(`
      INSERT INTO "tier_assignments"
        ("id", "user_id", "agent_id", "tier", "override_model", "override_provider",
         "override_auth_type", "auto_assigned_model", "fallback_models", "updated_at")
      SELECT
        gen_random_uuid()::varchar,
        COALESCE(ta."user_id", ''),
        a."id",
        'default',
        ta."override_model",
        ta."override_provider",
        ta."override_auth_type",
        ta."auto_assigned_model",
        ta."fallback_models",
        NOW()
      FROM "agents" a
      LEFT JOIN "tier_assignments" ta
        ON ta."agent_id" = a."id" AND ta."tier" = 'standard'
      WHERE NOT EXISTS (
        SELECT 1 FROM "tier_assignments" d
        WHERE d."agent_id" = a."id" AND d."tier" = 'default'
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "tier_assignments" WHERE "tier" = 'default'`);
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "complexity_routing_enabled"`);
    }
}
exports.AddComplexityRoutingFlag1777100000000 = AddComplexityRoutingFlag1777100000000;
//# sourceMappingURL=1777100000000-AddComplexityRoutingFlag.js.map