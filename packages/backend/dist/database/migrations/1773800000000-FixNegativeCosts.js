"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixNegativeCosts1773800000000 = void 0;
class FixNegativeCosts1773800000000 {
    async up(queryRunner) {
        await queryRunner.query(`UPDATE "agent_messages" SET "cost_usd" = NULL WHERE "cost_usd" < 0`);
    }
    async down(_queryRunner) {
    }
}
exports.FixNegativeCosts1773800000000 = FixNegativeCosts1773800000000;
//# sourceMappingURL=1773800000000-FixNegativeCosts.js.map