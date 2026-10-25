"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRoutingTier1772100000000 = void 0;
class AddRoutingTier1772100000000 {
    name = 'AddRoutingTier1772100000000';
    async up(queryRunner) {
        const result = await queryRunner.query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'agent_messages' AND column_name = 'routing_tier'`);
        if (result.length === 0) {
            await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "routing_tier" character varying`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "routing_tier"`);
    }
}
exports.AddRoutingTier1772100000000 = AddRoutingTier1772100000000;
//# sourceMappingURL=1772100000000-AddRoutingTier.js.map