"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendDashboardCoveringIndex1801200000000 = void 0;
class ExtendDashboardCoveringIndex1801200000000 {
    name = 'ExtendDashboardCoveringIndex1801200000000';
    transaction = false;
    static USAGE_INDEX = 'IDX_agent_messages_provider_usage';
    static SWAP_INDEX = 'IDX_agent_messages_provider_usage_swap';
    static LEGACY_V2_INDEX = 'IDX_agent_messages_provider_usage_v2';
    static SKILLS_INDEX = 'IDX_agent_messages_skill_runs';
    static USAGE_INCLUDE = [
        'model',
        'provider',
        'auth_type',
        'provider_key_label',
        'input_tokens',
        'output_tokens',
        'cost_usd',
        'status',
        'request_id',
        'id',
    ];
    async up(queryRunner) {
        const { USAGE_INDEX, SWAP_INDEX, LEGACY_V2_INDEX, SKILLS_INDEX, USAGE_INCLUDE } = ExtendDashboardCoveringIndex1801200000000;
        if (!(await this.usageIndexConverged(queryRunner))) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${SWAP_INDEX}"`);
            await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${SWAP_INDEX}" ON "agent_messages" ("tenant_id", "timestamp") INCLUDE (${USAGE_INCLUDE.map((col) => `"${col}"`).join(', ')})`);
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${USAGE_INDEX}"`);
            await queryRunner.query(`ALTER INDEX IF EXISTS "${SWAP_INDEX}" RENAME TO "${USAGE_INDEX}"`);
        }
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${LEGACY_V2_INDEX}"`);
        if (await this.indexIsInvalid(queryRunner, SKILLS_INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${SKILLS_INDEX}"`);
        }
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${SKILLS_INDEX}" ON "agent_messages" ("tenant_id", "timestamp") INCLUDE ("skill_name", "agent_name", "agent_id") WHERE "skill_name" IS NOT NULL`);
    }
    async down(queryRunner) {
        const { USAGE_INDEX, SWAP_INDEX, SKILLS_INDEX } = ExtendDashboardCoveringIndex1801200000000;
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${SWAP_INDEX}"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${SWAP_INDEX}" ON "agent_messages" ("tenant_id", "timestamp") INCLUDE ("model", "provider", "auth_type", "input_tokens", "output_tokens", "cost_usd")`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${USAGE_INDEX}"`);
        await queryRunner.query(`ALTER INDEX IF EXISTS "${SWAP_INDEX}" RENAME TO "${USAGE_INDEX}"`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${SKILLS_INDEX}"`);
    }
    async usageIndexConverged(queryRunner) {
        const rows = await queryRunner.query(`SELECT indexdef FROM pg_indexes WHERE indexname = $1`, [ExtendDashboardCoveringIndex1801200000000.USAGE_INDEX]);
        if (rows.length === 0)
            return false;
        const match = rows[0].indexdef.match(/INCLUDE \(([^)]*)\)/);
        if (!match)
            return false;
        const columns = match[1].split(',').map((col) => col.trim().replace(/"/g, ''));
        if (!ExtendDashboardCoveringIndex1801200000000.USAGE_INCLUDE.every((col) => columns.includes(col))) {
            return false;
        }
        return !(await this.indexIsInvalid(queryRunner, ExtendDashboardCoveringIndex1801200000000.USAGE_INDEX));
    }
    async indexIsInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        return rows.length > 0;
    }
}
exports.ExtendDashboardCoveringIndex1801200000000 = ExtendDashboardCoveringIndex1801200000000;
//# sourceMappingURL=1801200000000-ExtendDashboardCoveringIndex.js.map