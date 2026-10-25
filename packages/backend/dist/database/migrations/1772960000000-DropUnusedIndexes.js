"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropUnusedIndexes1772960000000 = void 0;
class DropUnusedIndexes1772960000000 {
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_4d007c4a559001d501d06fb6f4"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_3af795abffe699032a63ff5c22"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cost_snapshots_tenant_agent_time"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_e9678de7cf6f122f3286bb4075"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE INDEX "IDX_4d007c4a559001d501d06fb6f4" ON "tool_executions" ("tenant_id", "agent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_3af795abffe699032a63ff5c22" ON "token_usage_snapshots" ("tenant_id", "agent_id", "snapshot_time")`);
        await queryRunner.query(`CREATE INDEX "IDX_cost_snapshots_tenant_agent_time" ON "cost_snapshots" ("tenant_id", "agent_id", "snapshot_time")`);
        await queryRunner.query(`CREATE INDEX "IDX_e9678de7cf6f122f3286bb4075" ON "agent_logs" ("tenant_id", "agent_id", "timestamp")`);
    }
}
exports.DropUnusedIndexes1772960000000 = DropUnusedIndexes1772960000000;
//# sourceMappingURL=1772960000000-DropUnusedIndexes.js.map