"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropRedundantTenantAgentNameIndex1793100000000 = void 0;
class DropRedundantTenantAgentNameIndex1793100000000 {
    name = 'DropRedundantTenantAgentNameIndex1793100000000';
    transaction = false;
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_tenant_agent_name_ts"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_tenant_agent_name_ts" ON "agent_messages" ("tenant_id", "agent_name", "timestamp")`);
    }
}
exports.DropRedundantTenantAgentNameIndex1793100000000 = DropRedundantTenantAgentNameIndex1793100000000;
//# sourceMappingURL=1793100000000-DropRedundantTenantAgentNameIndex.js.map