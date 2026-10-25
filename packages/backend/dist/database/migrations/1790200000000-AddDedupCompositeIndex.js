"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDedupCompositeIndex1790200000000 = void 0;
class AddDedupCompositeIndex1790200000000 {
    name = 'AddDedupCompositeIndex1790200000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_tenant_agent_model_status_ts" ON "agent_messages" ("tenant_id", "agent_id", "model", "status", "timestamp")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_tenant_agent_model_status_ts"`);
    }
}
exports.AddDedupCompositeIndex1790200000000 = AddDedupCompositeIndex1790200000000;
//# sourceMappingURL=1790200000000-AddDedupCompositeIndex.js.map