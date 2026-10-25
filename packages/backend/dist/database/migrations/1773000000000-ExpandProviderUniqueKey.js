"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandProviderUniqueKey1773000000000 = void 0;
class ExpandProviderUniqueKey1773000000000 {
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_agent_provider"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_agent_id_provider"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_6f1a1e6c8d2b3a4f5e7d9c0b1a"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_providers_agent_provider_auth" ` +
            `ON "user_providers" ("agent_id", "provider", "auth_type")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_agent_provider_auth"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_providers_agent_id_provider" ` +
            `ON "user_providers" ("agent_id", "provider")`);
    }
}
exports.ExpandProviderUniqueKey1773000000000 = ExpandProviderUniqueKey1773000000000;
//# sourceMappingURL=1773000000000-ExpandProviderUniqueKey.js.map