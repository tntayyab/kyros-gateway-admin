"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRoutingReason1772300000000 = void 0;
class AddRoutingReason1772300000000 {
    name = 'AddRoutingReason1772300000000';
    async up(queryRunner) {
        const result = await queryRunner.query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'agent_messages' AND column_name = 'routing_reason'`);
        if (result.length === 0) {
            await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "routing_reason" character varying`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "routing_reason"`);
    }
}
exports.AddRoutingReason1772300000000 = AddRoutingReason1772300000000;
//# sourceMappingURL=1772300000000-AddRoutingReason.js.map