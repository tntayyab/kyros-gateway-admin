"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFallbacks1772905260464 = void 0;
class AddFallbacks1772905260464 {
    name = 'AddFallbacks1772905260464';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tier_assignments" ADD COLUMN "fallback_models" text DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "fallback_from_model" varchar DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "fallback_index" integer DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "fallback_index"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "fallback_from_model"`);
        await queryRunner.query(`ALTER TABLE "tier_assignments" DROP COLUMN "fallback_models"`);
    }
}
exports.AddFallbacks1772905260464 = AddFallbacks1772905260464;
//# sourceMappingURL=1772905260464-AddFallbacks.js.map