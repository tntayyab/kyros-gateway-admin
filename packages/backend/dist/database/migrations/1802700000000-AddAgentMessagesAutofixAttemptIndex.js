"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentMessagesAutofixAttemptIndex1802700000000 = void 0;
class AddAgentMessagesAutofixAttemptIndex1802700000000 {
    name = 'AddAgentMessagesAutofixAttemptIndex1802700000000';
    transaction = false;
    static INDEX = 'IDX_agent_messages_autofix_request';
    async up(queryRunner) {
        const { INDEX } = AddAgentMessagesAutofixAttemptIndex1802700000000;
        if (await this.indexIsInvalid(queryRunner, INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${INDEX}"`);
        }
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${INDEX}" ON "agent_messages" ("request_id") WHERE "autofix_applied" = true`);
        await queryRunner.query(`ANALYZE "agent_messages"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${AddAgentMessagesAutofixAttemptIndex1802700000000.INDEX}"`);
    }
    async indexIsInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        return rows.length > 0;
    }
}
exports.AddAgentMessagesAutofixAttemptIndex1802700000000 = AddAgentMessagesAutofixAttemptIndex1802700000000;
//# sourceMappingURL=1802700000000-AddAgentMessagesAutofixAttemptIndex.js.map