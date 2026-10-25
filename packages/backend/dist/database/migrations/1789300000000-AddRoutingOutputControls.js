"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRoutingOutputControls1789300000000 = void 0;
class AddRoutingOutputControls1789300000000 {
    name = 'AddRoutingOutputControls1789300000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tier_assignments" ADD COLUMN "output_modality" varchar NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" ADD COLUMN "response_mode" varchar NOT NULL DEFAULT 'buffered'`);
        await queryRunner.query(`ALTER TABLE "specificity_assignments" ADD COLUMN "output_modality" varchar NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "specificity_assignments" ADD COLUMN "response_mode" varchar NOT NULL DEFAULT 'buffered'`);
        await queryRunner.query(`ALTER TABLE "header_tiers" ADD COLUMN "output_modality" varchar NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "header_tiers" ADD COLUMN "response_mode" varchar NOT NULL DEFAULT 'buffered'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "header_tiers" DROP COLUMN "response_mode"`);
        await queryRunner.query(`ALTER TABLE "header_tiers" DROP COLUMN "output_modality"`);
        await queryRunner.query(`ALTER TABLE "specificity_assignments" DROP COLUMN "response_mode"`);
        await queryRunner.query(`ALTER TABLE "specificity_assignments" DROP COLUMN "output_modality"`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" DROP COLUMN "response_mode"`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" DROP COLUMN "output_modality"`);
    }
}
exports.AddRoutingOutputControls1789300000000 = AddRoutingOutputControls1789300000000;
//# sourceMappingURL=1789300000000-AddRoutingOutputControls.js.map