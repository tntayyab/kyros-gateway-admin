"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropLegacyRoutingColumns1784000000000 = void 0;
class DropLegacyRoutingColumns1784000000000 {
    async up(queryRunner) {
        for (const table of ['tier_assignments', 'specificity_assignments', 'header_tiers']) {
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "override_model"`);
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "override_provider"`);
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "override_auth_type"`);
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "fallback_models"`);
        }
        for (const table of ['tier_assignments', 'specificity_assignments']) {
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "auto_assigned_model"`);
        }
    }
    async down(queryRunner) {
        for (const table of ['tier_assignments', 'specificity_assignments']) {
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "auto_assigned_model" varchar DEFAULT NULL`);
        }
        for (const table of ['tier_assignments', 'specificity_assignments', 'header_tiers']) {
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "fallback_models" text DEFAULT NULL`);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "override_auth_type" varchar DEFAULT NULL`);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "override_provider" varchar DEFAULT NULL`);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "override_model" varchar DEFAULT NULL`);
        }
    }
}
exports.DropLegacyRoutingColumns1784000000000 = DropLegacyRoutingColumns1784000000000;
//# sourceMappingURL=1784000000000-DropLegacyRoutingColumns.js.map