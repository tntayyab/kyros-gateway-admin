"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMessageFeedback1775600000000 = void 0;
class AddMessageFeedback1775600000000 {
    name = 'AddMessageFeedback1775600000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "feedback_rating" varchar DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "feedback_tags" varchar DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "feedback_details" text DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "feedback_details"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "feedback_tags"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "feedback_rating"`);
    }
}
exports.AddMessageFeedback1775600000000 = AddMessageFeedback1775600000000;
//# sourceMappingURL=1775600000000-AddMessageFeedback.js.map