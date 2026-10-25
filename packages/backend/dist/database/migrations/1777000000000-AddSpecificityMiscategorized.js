"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSpecificityMiscategorized1777000000000 = void 0;
class AddSpecificityMiscategorized1777000000000 {
    name = 'AddSpecificityMiscategorized1777000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "specificity_miscategorized" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_agent_messages_miscategorized" ON "agent_messages" ("tenant_id", "agent_id", "specificity_category") WHERE "specificity_miscategorized" = true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_agent_messages_miscategorized"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "specificity_miscategorized"`);
    }
}
exports.AddSpecificityMiscategorized1777000000000 = AddSpecificityMiscategorized1777000000000;
//# sourceMappingURL=1777000000000-AddSpecificityMiscategorized.js.map