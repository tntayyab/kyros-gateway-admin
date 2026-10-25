"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddErrorsPartialIndex1790300000000 = void 0;
class AddErrorsPartialIndex1790300000000 {
    name = 'AddErrorsPartialIndex1790300000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_errors" ON "agent_messages" ("tenant_id", "timestamp") WHERE "status" IN ('error', 'fallback_error', 'rate_limited')`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_errors"`);
    }
}
exports.AddErrorsPartialIndex1790300000000 = AddErrorsPartialIndex1790300000000;
//# sourceMappingURL=1790300000000-AddErrorsPartialIndex.js.map