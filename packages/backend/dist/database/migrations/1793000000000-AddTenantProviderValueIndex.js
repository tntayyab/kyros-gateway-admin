"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTenantProviderValueIndex1793000000000 = void 0;
class AddTenantProviderValueIndex1793000000000 {
    name = 'AddTenantProviderValueIndex1793000000000';
    transaction = false;
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_tenant_provider_value"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_tenant_provider_value" ON "agent_messages" ("tenant_id", "provider") WHERE "provider" IS NOT NULL AND "provider" <> ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_tenant_provider_value"`);
    }
}
exports.AddTenantProviderValueIndex1793000000000 = AddTenantProviderValueIndex1793000000000;
//# sourceMappingURL=1793000000000-AddTenantProviderValueIndex.js.map