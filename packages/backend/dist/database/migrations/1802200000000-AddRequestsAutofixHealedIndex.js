"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRequestsAutofixHealedIndex1802200000000 = void 0;
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
class AddRequestsAutofixHealedIndex1802200000000 {
    name = 'AddRequestsAutofixHealedIndex1802200000000';
    transaction = false;
    static INDEX = 'IDX_requests_autofix_healed';
    async up(queryRunner) {
        if ((0, detect_self_hosted_1.isSelfHosted)())
            return;
        const { INDEX } = AddRequestsAutofixHealedIndex1802200000000;
        if (await this.indexIsInvalid(queryRunner, INDEX)) {
            await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${INDEX}"`);
        }
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${INDEX}" ON "requests" ("tenant_id", "timestamp") INCLUDE ("status") WHERE "autofix_status" = 'retry_succeeded'`);
        await queryRunner.query(`ANALYZE "requests"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${AddRequestsAutofixHealedIndex1802200000000.INDEX}"`);
    }
    async indexIsInvalid(queryRunner, indexName) {
        const rows = await queryRunner.query(`SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid WHERE c.relname = $1 AND NOT i.indisvalid`, [indexName]);
        return rows.length > 0;
    }
}
exports.AddRequestsAutofixHealedIndex1802200000000 = AddRequestsAutofixHealedIndex1802200000000;
//# sourceMappingURL=1802200000000-AddRequestsAutofixHealedIndex.js.map