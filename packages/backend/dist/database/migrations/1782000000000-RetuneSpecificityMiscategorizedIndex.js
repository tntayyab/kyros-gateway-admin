"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetuneSpecificityMiscategorizedIndex1782000000000 = void 0;
class RetuneSpecificityMiscategorizedIndex1782000000000 {
    name = 'RetuneSpecificityMiscategorizedIndex1782000000000';
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_miscategorized"`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_miscategorized" ON "agent_messages" ("agent_id", "specificity_category") WHERE "specificity_miscategorized" = true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_miscategorized"`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_miscategorized" ON "agent_messages" ("tenant_id", "agent_id", "specificity_category") WHERE "specificity_miscategorized" = true`);
    }
}
exports.RetuneSpecificityMiscategorizedIndex1782000000000 = RetuneSpecificityMiscategorizedIndex1782000000000;
//# sourceMappingURL=1782000000000-RetuneSpecificityMiscategorizedIndex.js.map