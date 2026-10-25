"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserProviderIdToAgentMessages1792000000000 = void 0;
class AddUserProviderIdToAgentMessages1792000000000 {
    name = 'AddUserProviderIdToAgentMessages1792000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "user_provider_id" varchar`);
        await queryRunner.query(`
      ALTER TABLE "agent_messages"
      ADD CONSTRAINT "FK_agent_messages_user_provider"
      FOREIGN KEY ("user_provider_id") REFERENCES "user_providers"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
        await queryRunner.query(`CREATE INDEX "IDX_agent_messages_user_provider" ON "agent_messages" ("user_provider_id", "tenant_id", "timestamp" DESC)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_user_provider"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP CONSTRAINT IF EXISTS "FK_agent_messages_user_provider"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "user_provider_id"`);
    }
}
exports.AddUserProviderIdToAgentMessages1792000000000 = AddUserProviderIdToAgentMessages1792000000000;
//# sourceMappingURL=1792000000000-AddUserProviderIdToAgentMessages.js.map