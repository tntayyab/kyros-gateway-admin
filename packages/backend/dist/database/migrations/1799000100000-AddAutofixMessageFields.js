"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutofixMessageFields1799000100000 = void 0;
class AddAutofixMessageFields1799000100000 {
    name = 'AddAutofixMessageFields1799000100000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "autofix_applied" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "autofix_group_id" character varying`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "autofix_role" character varying`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "autofix_operations" jsonb`);
        await queryRunner.query(`CREATE INDEX "IDX_agent_messages_autofix_group" ON "agent_messages" ("tenant_id", "autofix_group_id") WHERE "autofix_group_id" IS NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_agent_messages_autofix_group"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "autofix_operations"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "autofix_role"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "autofix_group_id"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "autofix_applied"`);
    }
}
exports.AddAutofixMessageFields1799000100000 = AddAutofixMessageFields1799000100000;
//# sourceMappingURL=1799000100000-AddAutofixMessageFields.js.map