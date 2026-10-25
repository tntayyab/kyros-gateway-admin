"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProviderModelCache1773400000000 = void 0;
class AddProviderModelCache1773400000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" ADD COLUMN "cached_models" text`);
        await queryRunner.query(`ALTER TABLE "user_providers" ADD COLUMN "models_fetched_at" timestamp`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN "models_fetched_at"`);
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN "cached_models"`);
    }
}
exports.AddProviderModelCache1773400000000 = AddProviderModelCache1773400000000;
//# sourceMappingURL=1773400000000-AddProviderModelCache.js.map