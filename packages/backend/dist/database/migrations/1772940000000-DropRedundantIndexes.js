"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropRedundantIndexes1772940000000 = void 0;
class DropRedundantIndexes1772940000000 {
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_519ec0b8e9fc7c2e53d300c69c"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_1d3c0f0f21ffa94c7300a2e996"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc0146344144249cd7dde2f8ad"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_timestamp"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_7fc8d9c06936a673fd5c404706"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_a24432cde19440451cc7b5d15f"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ff92361a95863b8f0de3a371e5"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_e3e44ae5bdb48ceeb10d7880cf"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_e981397068db115bcd95a39396"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_039a398c03e68e46a0fc0bc998"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_305fe9e3e5efff31a20a90c12e"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_49c9b53af0ef0839174ce670ef"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_468b7d3a69ee28a127cd8287b9"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_3bf823e7c31aa4a5f12fcde527"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE INDEX "IDX_519ec0b8e9fc7c2e53d300c69c" ON "agent_messages" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_1d3c0f0f21ffa94c7300a2e996" ON "agent_messages" ("agent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_cc0146344144249cd7dde2f8ad" ON "agent_messages" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_agent_messages_timestamp" ON "agent_messages" ("timestamp")`);
        await queryRunner.query(`CREATE INDEX "IDX_7fc8d9c06936a673fd5c404706" ON "tool_executions" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_a24432cde19440451cc7b5d15f" ON "tool_executions" ("agent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_ff92361a95863b8f0de3a371e5" ON "llm_calls" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_e3e44ae5bdb48ceeb10d7880cf" ON "llm_calls" ("agent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_e981397068db115bcd95a39396" ON "agent_logs" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_039a398c03e68e46a0fc0bc998" ON "agent_logs" ("agent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_305fe9e3e5efff31a20a90c12e" ON "token_usage_snapshots" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_49c9b53af0ef0839174ce670ef" ON "token_usage_snapshots" ("agent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_468b7d3a69ee28a127cd8287b9" ON "cost_snapshots" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_3bf823e7c31aa4a5f12fcde527" ON "cost_snapshots" ("agent_id")`);
    }
}
exports.DropRedundantIndexes1772940000000 = DropRedundantIndexes1772940000000;
//# sourceMappingURL=1772940000000-DropRedundantIndexes.js.map