"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddModelDisplayName1772920000000 = void 0;
class AddModelDisplayName1772920000000 {
    name = 'AddModelDisplayName1772920000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "model_pricing" ADD COLUMN "display_name" varchar DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "model_pricing" DROP COLUMN "display_name"`);
    }
}
exports.AddModelDisplayName1772920000000 = AddModelDisplayName1772920000000;
//# sourceMappingURL=1772920000000-AddModelDisplayName.js.map