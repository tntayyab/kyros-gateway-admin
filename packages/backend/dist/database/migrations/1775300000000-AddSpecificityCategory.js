"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSpecificityCategory1775300000000 = void 0;
class AddSpecificityCategory1775300000000 {
    name = 'AddSpecificityCategory1775300000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "specificity_category" varchar DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "specificity_category"`);
    }
}
exports.AddSpecificityCategory1775300000000 = AddSpecificityCategory1775300000000;
//# sourceMappingURL=1775300000000-AddSpecificityCategory.js.map