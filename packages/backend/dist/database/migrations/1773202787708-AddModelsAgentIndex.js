"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddModelsAgentIndex1773202787708 = void 0;
class AddModelsAgentIndex1773202787708 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_agent_messages_tenant_agent_model"
        ON "agent_messages" ("tenant_id", "agent_name", "model")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_tenant_agent_model"`);
    }
}
exports.AddModelsAgentIndex1773202787708 = AddModelsAgentIndex1773202787708;
//# sourceMappingURL=1773202787708-AddModelsAgentIndex.js.map