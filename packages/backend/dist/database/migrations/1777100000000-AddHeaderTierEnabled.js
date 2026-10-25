"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddHeaderTierEnabled1777100000000 = void 0;
class AddHeaderTierEnabled1777100000000 {
    name = 'AddHeaderTierEnabled1777100000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "header_tiers" ADD COLUMN "enabled" boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "header_tiers" DROP COLUMN "enabled"`);
    }
}
exports.AddHeaderTierEnabled1777100000000 = AddHeaderTierEnabled1777100000000;
//# sourceMappingURL=1777100000000-AddHeaderTierEnabled.js.map