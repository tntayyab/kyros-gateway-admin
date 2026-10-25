"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProviderKeyLabelToAgentMessages1785100000000 = void 0;
class AddProviderKeyLabelToAgentMessages1785100000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "provider_key_label" varchar`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "provider_key_label"`);
    }
}
exports.AddProviderKeyLabelToAgentMessages1785100000000 = AddProviderKeyLabelToAgentMessages1785100000000;
//# sourceMappingURL=1785100000000-AddProviderKeyLabelToAgentMessages.js.map