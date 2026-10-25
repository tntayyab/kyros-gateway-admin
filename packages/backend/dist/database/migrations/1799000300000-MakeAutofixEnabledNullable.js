"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeAutofixEnabledNullable1799000300000 = void 0;
class MakeAutofixEnabledNullable1799000300000 {
    name = 'MakeAutofixEnabledNullable1799000300000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "autofix_enabled" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "autofix_enabled" DROP NOT NULL`);
        await queryRunner.query(`UPDATE "agents" SET "autofix_enabled" = NULL WHERE "autofix_enabled" = false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE "agents" SET "autofix_enabled" = false WHERE "autofix_enabled" IS NULL`);
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "autofix_enabled" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "autofix_enabled" SET NOT NULL`);
    }
}
exports.MakeAutofixEnabledNullable1799000300000 = MakeAutofixEnabledNullable1799000300000;
//# sourceMappingURL=1799000300000-MakeAutofixEnabledNullable.js.map