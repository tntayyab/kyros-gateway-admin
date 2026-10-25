"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlimTenantAgentModelIndex1802000000000 = void 0;
class SlimTenantAgentModelIndex1802000000000 {
    name = 'SlimTenantAgentModelIndex1802000000000';
    transaction = false;
    static OLD_INDEX = 'IDX_agent_messages_tenant_agent_model_status_ts';
    static NEW_INDEX = 'IDX_agent_messages_tenant_agent_id_model';
    async up(queryRunner) {
        const { OLD_INDEX, NEW_INDEX } = SlimTenantAgentModelIndex1802000000000;
        if (await this.indexIsInvalid(queryRunner, NEW_INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${NEW_INDEX}"`);
        }
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${NEW_INDEX}" ON "agent_messages" ("tenant_id", "agent_id", "model")`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${OLD_INDEX}"`);
    }
    async down(queryRunner) {
        const { OLD_INDEX, NEW_INDEX } = SlimTenantAgentModelIndex1802000000000;
        if (await this.indexIsInvalid(queryRunner, OLD_INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${OLD_INDEX}"`);
        }
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${OLD_INDEX}" ON "agent_messages" ("tenant_id", "agent_id", "model", "status", "timestamp")`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${NEW_INDEX}"`);
    }
    async indexIsInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        return rows.length > 0;
    }
}
exports.SlimTenantAgentModelIndex1802000000000 = SlimTenantAgentModelIndex1802000000000;
//# sourceMappingURL=1802000000000-SlimTenantAgentModelIndex.js.map