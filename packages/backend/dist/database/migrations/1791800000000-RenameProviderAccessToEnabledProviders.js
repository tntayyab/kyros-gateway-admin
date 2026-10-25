"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameProviderAccessToEnabledProviders1791800000000 = void 0;
class RenameProviderAccessToEnabledProviders1791800000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_provider_access" RENAME TO "agent_enabled_providers"`);
        await queryRunner.query(`ALTER TABLE "agent_enabled_providers" RENAME CONSTRAINT "PK_agent_provider_access" TO "PK_agent_enabled_providers"`);
        await queryRunner.query(`ALTER TABLE "agent_enabled_providers" RENAME CONSTRAINT "FK_agent_provider_access_agent" TO "FK_agent_enabled_providers_agent"`);
        await queryRunner.query(`ALTER TABLE "agent_enabled_providers" RENAME CONSTRAINT "FK_agent_provider_access_provider" TO "FK_agent_enabled_providers_provider"`);
        await queryRunner.query(`ALTER INDEX "IDX_agent_provider_access_provider" RENAME TO "IDX_agent_enabled_providers_provider"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER INDEX "IDX_agent_enabled_providers_provider" RENAME TO "IDX_agent_provider_access_provider"`);
        await queryRunner.query(`ALTER TABLE "agent_enabled_providers" RENAME CONSTRAINT "FK_agent_enabled_providers_provider" TO "FK_agent_provider_access_provider"`);
        await queryRunner.query(`ALTER TABLE "agent_enabled_providers" RENAME CONSTRAINT "FK_agent_enabled_providers_agent" TO "FK_agent_provider_access_agent"`);
        await queryRunner.query(`ALTER TABLE "agent_enabled_providers" RENAME CONSTRAINT "PK_agent_enabled_providers" TO "PK_agent_provider_access"`);
        await queryRunner.query(`ALTER TABLE "agent_enabled_providers" RENAME TO "agent_provider_access"`);
    }
}
exports.RenameProviderAccessToEnabledProviders1791800000000 = RenameProviderAccessToEnabledProviders1791800000000;
//# sourceMappingURL=1791800000000-RenameProviderAccessToEnabledProviders.js.map