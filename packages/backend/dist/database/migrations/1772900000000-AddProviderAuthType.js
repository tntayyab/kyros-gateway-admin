"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProviderAuthType1772900000000 = void 0;
class AddProviderAuthType1772900000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" ADD "auth_type" varchar NOT NULL DEFAULT 'api_key'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN "auth_type"`);
    }
}
exports.AddProviderAuthType1772900000000 = AddProviderAuthType1772900000000;
//# sourceMappingURL=1772900000000-AddProviderAuthType.js.map