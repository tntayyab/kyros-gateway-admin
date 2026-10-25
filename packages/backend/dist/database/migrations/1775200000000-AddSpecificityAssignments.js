"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSpecificityAssignments1775200000000 = void 0;
class AddSpecificityAssignments1775200000000 {
    name = 'AddSpecificityAssignments1775200000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "specificity_assignments" (
        "id" varchar PRIMARY KEY,
        "user_id" varchar NOT NULL,
        "agent_id" varchar NOT NULL,
        "category" varchar NOT NULL,
        "is_active" boolean NOT NULL DEFAULT false,
        "override_model" varchar,
        "override_provider" varchar,
        "override_auth_type" varchar,
        "auto_assigned_model" varchar,
        "fallback_models" text,
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_specificity_assignments_agent_category"
        ON "specificity_assignments" ("agent_id", "category")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "specificity_assignments"`);
    }
}
exports.AddSpecificityAssignments1775200000000 = AddSpecificityAssignments1775200000000;
//# sourceMappingURL=1775200000000-AddSpecificityAssignments.js.map