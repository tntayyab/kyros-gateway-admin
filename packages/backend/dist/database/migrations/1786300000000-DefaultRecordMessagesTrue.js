"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRecordMessagesTrue1786300000000 = void 0;
class DefaultRecordMessagesTrue1786300000000 {
    name = 'DefaultRecordMessagesTrue1786300000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "record_messages" SET DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "record_messages" SET DEFAULT false`);
    }
}
exports.DefaultRecordMessagesTrue1786300000000 = DefaultRecordMessagesTrue1786300000000;
//# sourceMappingURL=1786300000000-DefaultRecordMessagesTrue.js.map