"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddHeaderTiers1776710000000 = void 0;
class AddHeaderTiers1776710000000 {
    name = 'AddHeaderTiers1776710000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "header_tiers" (
        "id" varchar PRIMARY KEY,
        "tenant_id" varchar,
        "agent_id" varchar NOT NULL,
        "user_id" varchar,
        "name" varchar NOT NULL,
        "header_key" varchar NOT NULL,
        "header_value" varchar NOT NULL,
        "badge_color" varchar NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "override_model" varchar,
        "override_provider" varchar,
        "override_auth_type" varchar,
        "fallback_models" text,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_header_tiers_agent_sort"
        ON "header_tiers" ("agent_id", "sort_order")
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_header_tiers_agent_name"
        ON "header_tiers" ("agent_id", LOWER("name"))
    `);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "header_tier_id" varchar DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "header_tier_name" varchar DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "header_tier_color" varchar DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "header_tier_color"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "header_tier_name"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "header_tier_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "header_tiers"`);
    }
}
exports.AddHeaderTiers1776710000000 = AddHeaderTiers1776710000000;
//# sourceMappingURL=1776710000000-AddHeaderTiers.js.map