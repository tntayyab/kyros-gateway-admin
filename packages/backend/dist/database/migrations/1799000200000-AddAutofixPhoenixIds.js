"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutofixPhoenixIds1799000200000 = void 0;
class AddAutofixPhoenixIds1799000200000 {
    name = 'AddAutofixPhoenixIds1799000200000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "autofix_phoenix" jsonb`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "autofix_phoenix"`);
    }
}
exports.AddAutofixPhoenixIds1799000200000 = AddAutofixPhoenixIds1799000200000;
//# sourceMappingURL=1799000200000-AddAutofixPhoenixIds.js.map