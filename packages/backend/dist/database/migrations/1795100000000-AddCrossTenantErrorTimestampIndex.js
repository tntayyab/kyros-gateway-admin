"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCrossTenantErrorTimestampIndex1795100000000 = void 0;
class AddCrossTenantErrorTimestampIndex1795100000000 {
    name = 'AddCrossTenantErrorTimestampIndex1795100000000';
    transaction = false;
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_errors_timestamp"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_errors_timestamp" ON "agent_messages" ("timestamp") WHERE "status" IN ('error', 'fallback_error', 'rate_limited')`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_errors_timestamp"`);
    }
}
exports.AddCrossTenantErrorTimestampIndex1795100000000 = AddCrossTenantErrorTimestampIndex1795100000000;
//# sourceMappingURL=1795100000000-AddCrossTenantErrorTimestampIndex.js.map