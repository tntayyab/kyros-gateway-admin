"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropSavingsBaselineColumns1791700000000 = void 0;
class DropSavingsBaselineColumns1791700000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN IF EXISTS "savings_baseline_model"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "baseline_cost_usd"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "baseline_model_id"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "savings_baseline_model" varchar DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "baseline_model_id" varchar DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "baseline_cost_usd" decimal(10,6) DEFAULT NULL`);
    }
}
exports.DropSavingsBaselineColumns1791700000000 = DropSavingsBaselineColumns1791700000000;
//# sourceMappingURL=1791700000000-DropSavingsBaselineColumns.js.map