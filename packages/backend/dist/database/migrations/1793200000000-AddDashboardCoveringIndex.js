"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDashboardCoveringIndex1793200000000 = void 0;
class AddDashboardCoveringIndex1793200000000 {
    name = 'AddDashboardCoveringIndex1793200000000';
    transaction = false;
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_provider_usage_v2"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_provider_usage_v2" ON "agent_messages" ("tenant_id", "timestamp") INCLUDE ("model", "provider", "auth_type", "input_tokens", "output_tokens", "cost_usd")`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_provider_usage"`);
        await queryRunner.query(`ALTER INDEX IF EXISTS "IDX_agent_messages_provider_usage_v2" RENAME TO "IDX_agent_messages_provider_usage"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_provider_usage_v2"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_provider_usage_v2" ON "agent_messages" ("tenant_id", "timestamp") INCLUDE ("provider", "auth_type", "input_tokens", "output_tokens", "cost_usd")`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_provider_usage"`);
        await queryRunner.query(`ALTER INDEX IF EXISTS "IDX_agent_messages_provider_usage_v2" RENAME TO "IDX_agent_messages_provider_usage"`);
    }
}
exports.AddDashboardCoveringIndex1793200000000 = AddDashboardCoveringIndex1793200000000;
//# sourceMappingURL=1793200000000-AddDashboardCoveringIndex.js.map