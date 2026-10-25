"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProviderRegion1773650000000 = void 0;
class AddProviderRegion1773650000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" ADD COLUMN IF NOT EXISTS "region" varchar DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN IF EXISTS "region"`);
    }
}
exports.AddProviderRegion1773650000000 = AddProviderRegion1773650000000;
//# sourceMappingURL=1773650000000-AddProviderRegion.js.map