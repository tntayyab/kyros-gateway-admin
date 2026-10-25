"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddEmailProviderKeyPrefix1773300000000 = void 0;
class AddEmailProviderKeyPrefix1773300000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "email_provider_configs" ADD COLUMN "key_prefix" varchar NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "email_provider_configs" DROP COLUMN "key_prefix"`);
    }
}
exports.AddEmailProviderKeyPrefix1773300000000 = AddEmailProviderKeyPrefix1773300000000;
//# sourceMappingURL=1773300000000-AddEmailProviderKeyPrefix.js.map