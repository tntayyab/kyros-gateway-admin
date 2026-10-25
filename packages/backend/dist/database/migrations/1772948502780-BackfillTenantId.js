"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillTenantId1772948502780 = void 0;
class BackfillTenantId1772948502780 {
    name = 'BackfillTenantId1772948502780';
    async up(queryRunner) {
        await queryRunner.query(`
      UPDATE agent_messages
      SET tenant_id = t.id
      FROM tenants t
      WHERE agent_messages.user_id = t.name
        AND agent_messages.tenant_id IS NULL
        AND agent_messages.user_id IS NOT NULL
    `);
    }
    async down(_queryRunner) {
    }
}
exports.BackfillTenantId1772948502780 = BackfillTenantId1772948502780;
//# sourceMappingURL=1772948502780-BackfillTenantId.js.map