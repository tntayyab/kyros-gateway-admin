"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentMessagesRecordingIndex1802600000000 = void 0;
class AddAgentMessagesRecordingIndex1802600000000 {
    name = 'AddAgentMessagesRecordingIndex1802600000000';
    transaction = false;
    static INDEX = 'IDX_agent_messages_recording';
    async up(queryRunner) {
        const { INDEX } = AddAgentMessagesRecordingIndex1802600000000;
        if (await this.indexIsInvalid(queryRunner, INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${INDEX}"`);
        }
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${INDEX}" ON "agent_messages" ("timestamp") INCLUDE ("id", "request_id", "recording_key") WHERE "recording_key" IS NOT NULL`);
        await queryRunner.query(`ANALYZE "agent_messages"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${AddAgentMessagesRecordingIndex1802600000000.INDEX}"`);
    }
    async indexIsInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        return rows.length > 0;
    }
}
exports.AddAgentMessagesRecordingIndex1802600000000 = AddAgentMessagesRecordingIndex1802600000000;
//# sourceMappingURL=1802600000000-AddAgentMessagesRecordingIndex.js.map