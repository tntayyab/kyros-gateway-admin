"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCallerAttribution1775400000000 = void 0;
class AddCallerAttribution1775400000000 {
    name = 'AddCallerAttribution1775400000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "caller_attribution" text DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "caller_attribution"`);
    }
}
exports.AddCallerAttribution1775400000000 = AddCallerAttribution1775400000000;
//# sourceMappingURL=1775400000000-AddCallerAttribution.js.map