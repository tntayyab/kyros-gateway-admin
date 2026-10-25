"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropComplexityRoutingFlag1780000000000 = void 0;
class DropComplexityRoutingFlag1780000000000 {
    name = 'DropComplexityRoutingFlag1780000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN IF EXISTS "complexity_routing_enabled"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "complexity_routing_enabled" boolean NOT NULL DEFAULT true`);
    }
}
exports.DropComplexityRoutingFlag1780000000000 = DropComplexityRoutingFlag1780000000000;
//# sourceMappingURL=1780000000000-DropComplexityRoutingFlag.js.map