"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDashboardIndexes1772905146384 = void 0;
class AddDashboardIndexes1772905146384 {
    name = 'AddDashboardIndexes1772905146384';
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_tenant_timestamp" ON "agent_messages" ("tenant_id", "timestamp")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_tenant_trace" ON "agent_messages" ("tenant_id", "trace_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notification_rules_user_agent" ON "notification_rules" ("user_id", "agent_name")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notification_rules_tenant_agent" ON "notification_rules" ("tenant_id", "agent_name")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_tenant_model" ON "agent_messages" ("tenant_id", "model")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_tenant_agent_status" ON "agent_messages" ("tenant_id", "agent_id", "status")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_tenant_agent_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_tenant_model"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_rules_tenant_agent"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_rules_user_agent"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_tenant_trace"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_tenant_timestamp"`);
    }
}
exports.AddDashboardIndexes1772905146384 = AddDashboardIndexes1772905146384;
//# sourceMappingURL=1772905146384-AddDashboardIndexes.js.map