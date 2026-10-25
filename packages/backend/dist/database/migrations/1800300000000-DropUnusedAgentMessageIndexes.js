"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropUnusedAgentMessageIndexes1800300000000 = void 0;
class DropUnusedAgentMessageIndexes1800300000000 {
    name = 'DropUnusedAgentMessageIndexes1800300000000';
    transaction = false;
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_user_id_timestamp"`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_errors"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_user_id_timestamp"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_user_id_timestamp" ON "agent_messages" ("user_id", "timestamp")`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_errors"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_errors" ON "agent_messages" ("tenant_id", "timestamp") WHERE "status" IN ('error', 'fallback_error', 'rate_limited')`);
    }
}
exports.DropUnusedAgentMessageIndexes1800300000000 = DropUnusedAgentMessageIndexes1800300000000;
//# sourceMappingURL=1800300000000-DropUnusedAgentMessageIndexes.js.map