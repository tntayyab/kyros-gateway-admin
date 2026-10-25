"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentMessagesUnlinkedIndex1802500000000 = void 0;
class AddAgentMessagesUnlinkedIndex1802500000000 {
    name = 'AddAgentMessagesUnlinkedIndex1802500000000';
    transaction = false;
    static INDEX = 'IDX_agent_messages_unlinked';
    async up(queryRunner) {
        const { INDEX } = AddAgentMessagesUnlinkedIndex1802500000000;
        if (await this.indexIsInvalid(queryRunner, INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${INDEX}"`);
        }
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${INDEX}" ON "agent_messages" ("tenant_id", "timestamp") INCLUDE ("id", "status") WHERE "request_id" IS NULL`);
        await queryRunner.query(`ANALYZE "agent_messages"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${AddAgentMessagesUnlinkedIndex1802500000000.INDEX}"`);
    }
    async indexIsInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        return rows.length > 0;
    }
}
exports.AddAgentMessagesUnlinkedIndex1802500000000 = AddAgentMessagesUnlinkedIndex1802500000000;
//# sourceMappingURL=1802500000000-AddAgentMessagesUnlinkedIndex.js.map