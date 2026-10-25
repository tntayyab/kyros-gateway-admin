"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeApiKeyNullable1772000000000 = void 0;
class MakeApiKeyNullable1772000000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "api_key_encrypted" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "api_key_encrypted" SET DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE "user_providers" SET "api_key_encrypted" = '' WHERE "api_key_encrypted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "api_key_encrypted" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "api_key_encrypted" DROP DEFAULT`);
    }
}
exports.MakeApiKeyNullable1772000000000 = MakeApiKeyNullable1772000000000;
//# sourceMappingURL=1772000000000-MakeApiKeyNullable.js.map