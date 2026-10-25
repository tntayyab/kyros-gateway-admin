"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentMessagesDirectUsageIndex1802900000000 = void 0;
class AddAgentMessagesDirectUsageIndex1802900000000 {
    name = 'AddAgentMessagesDirectUsageIndex1802900000000';
    transaction = false;
    static INDEX = 'IDX_agent_messages_direct_usage';
    async up(queryRunner) {
        const { INDEX } = AddAgentMessagesDirectUsageIndex1802900000000;
        if (await this.indexIsInvalid(queryRunner, INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${INDEX}"`);
        }
        await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "${INDEX}"
        ON "agent_messages" ("tenant_id", "agent_id", "timestamp")
        INCLUDE (
          "request_id", "status", "input_tokens", "output_tokens", "cost_usd",
          "agent_usage_rolled_up_at"
        )
        WHERE "routing_reason" = 'direct'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${AddAgentMessagesDirectUsageIndex1802900000000.INDEX}"`);
    }
    async indexIsInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        return rows.length > 0;
    }
}
exports.AddAgentMessagesDirectUsageIndex1802900000000 = AddAgentMessagesDirectUsageIndex1802900000000;
//# sourceMappingURL=1802900000000-AddAgentMessagesDirectUsageIndex.js.map