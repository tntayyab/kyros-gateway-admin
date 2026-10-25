"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReAddComplexityRoutingFlag1781000000000 = void 0;
class ReAddComplexityRoutingFlag1781000000000 {
    name = 'ReAddComplexityRoutingFlag1781000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "complexity_routing_enabled" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "complexity_routing_enabled" SET DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN IF EXISTS "complexity_routing_enabled"`);
    }
}
exports.ReAddComplexityRoutingFlag1781000000000 = ReAddComplexityRoutingFlag1781000000000;
//# sourceMappingURL=1781000000000-ReAddComplexityRoutingFlag.js.map