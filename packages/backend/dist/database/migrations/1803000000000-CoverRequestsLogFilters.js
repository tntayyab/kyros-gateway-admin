"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverRequestsLogFilters1803000000000 = void 0;
const index_rebuild_1 = require("../index-rebuild");
class CoverRequestsLogFilters1803000000000 {
    name = 'CoverRequestsLogFilters1803000000000';
    transaction = false;
    static REQUESTS_INDEX = {
        table: 'requests',
        index: 'IDX_requests_tenant_timestamp',
        build: 'IDX_requests_tenant_timestamp_next',
        key: '"tenant_id", "timestamp"',
        include: '"id", "agent_id", "status", "error_origin", "error_class", "requested_model"',
    };
    static FALLBACK_INDEX = 'IDX_agent_messages_fallback_window';
    async up(queryRunner) {
        const { REQUESTS_INDEX, FALLBACK_INDEX } = CoverRequestsLogFilters1803000000000;
        await (0, index_rebuild_1.rebuildIndexInPlace)(queryRunner, REQUESTS_INDEX, 'covering');
        await this.dropIfInvalid(queryRunner, FALLBACK_INDEX);
        await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "${FALLBACK_INDEX}"
        ON "agent_messages" ("tenant_id", "timestamp")
        INCLUDE ("request_id")
        WHERE "fallback_from_model" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        const { REQUESTS_INDEX, FALLBACK_INDEX } = CoverRequestsLogFilters1803000000000;
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${FALLBACK_INDEX}"`);
        await (0, index_rebuild_1.rebuildIndexInPlace)(queryRunner, REQUESTS_INDEX, 'plain');
    }
    async dropIfInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        if (rows.length > 0) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${indexName}"`);
        }
    }
}
exports.CoverRequestsLogFilters1803000000000 = CoverRequestsLogFilters1803000000000;
//# sourceMappingURL=1803000000000-CoverRequestsLogFilters.js.map