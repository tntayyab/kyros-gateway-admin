"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableRecordingForNewAgents1801500000000 = void 0;
class EnableRecordingForNewAgents1801500000000 {
    name = 'EnableRecordingForNewAgents1801500000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "record_messages" SET DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "record_messages" SET DEFAULT false`);
    }
}
exports.EnableRecordingForNewAgents1801500000000 = EnableRecordingForNewAgents1801500000000;
//# sourceMappingURL=1801500000000-EnableRecordingForNewAgents.js.map