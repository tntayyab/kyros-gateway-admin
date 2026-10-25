"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddParamDefaultsColumns1785000000000 = void 0;
class AddParamDefaultsColumns1785000000000 {
    async up(queryRunner) {
        for (const table of ['tier_assignments', 'specificity_assignments']) {
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "param_defaults" jsonb DEFAULT NULL`);
        }
    }
    async down(queryRunner) {
        for (const table of ['tier_assignments', 'specificity_assignments']) {
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "param_defaults"`);
        }
    }
}
exports.AddParamDefaultsColumns1785000000000 = AddParamDefaultsColumns1785000000000;
//# sourceMappingURL=1785000000000-AddParamDefaultsColumns.js.map