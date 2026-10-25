"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentRecordMessages1786100000000 = void 0;
class AddAgentRecordMessages1786100000000 {
    name = 'AddAgentRecordMessages1786100000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "record_messages" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN IF EXISTS "record_messages"`);
    }
}
exports.AddAgentRecordMessages1786100000000 = AddAgentRecordMessages1786100000000;
//# sourceMappingURL=1786100000000-AddAgentRecordMessages.js.map