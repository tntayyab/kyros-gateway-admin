"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableRecordMessagesForAll1789300000000 = void 0;
class EnableRecordMessagesForAll1789300000000 {
    name = 'EnableRecordMessagesForAll1789300000000';
    async up(queryRunner) {
        await queryRunner.query(`UPDATE agents SET record_messages = true WHERE record_messages = false`);
    }
    async down(queryRunner) {
    }
}
exports.EnableRecordMessagesForAll1789300000000 = EnableRecordMessagesForAll1789300000000;
//# sourceMappingURL=1789300000000-EnableRecordMessagesForAll.js.map