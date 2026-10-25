"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMessageProvider1775500000000 = void 0;
class AddMessageProvider1775500000000 {
    name = 'AddMessageProvider1775500000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "provider" varchar DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "provider"`);
    }
}
exports.AddMessageProvider1775500000000 = AddMessageProvider1775500000000;
//# sourceMappingURL=1775500000000-AddMessageProvider.js.map