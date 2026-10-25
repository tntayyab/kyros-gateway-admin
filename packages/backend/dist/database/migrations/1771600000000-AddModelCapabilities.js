"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddModelCapabilities1771600000000 = void 0;
class AddModelCapabilities1771600000000 {
    async up(queryRunner) {
        const hasColumn = async (col) => {
            const rows = await queryRunner.query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'model_pricing' AND column_name = $1`, [col]);
            return rows.length > 0;
        };
        if (!(await hasColumn('context_window'))) {
            await queryRunner.query(`ALTER TABLE model_pricing ADD COLUMN context_window INTEGER NOT NULL DEFAULT 128000`);
        }
        if (!(await hasColumn('capability_reasoning'))) {
            await queryRunner.query(`ALTER TABLE model_pricing ADD COLUMN capability_reasoning BOOLEAN NOT NULL DEFAULT false`);
        }
        if (!(await hasColumn('capability_code'))) {
            await queryRunner.query(`ALTER TABLE model_pricing ADD COLUMN capability_code BOOLEAN NOT NULL DEFAULT false`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE model_pricing DROP COLUMN IF EXISTS capability_code`);
        await queryRunner.query(`ALTER TABLE model_pricing DROP COLUMN IF EXISTS capability_reasoning`);
        await queryRunner.query(`ALTER TABLE model_pricing DROP COLUMN IF EXISTS context_window`);
    }
}
exports.AddModelCapabilities1771600000000 = AddModelCapabilities1771600000000;
//# sourceMappingURL=1771600000000-AddModelCapabilities.js.map