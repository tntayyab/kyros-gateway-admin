"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRequestParamsColumn1786000000000 = void 0;
class AddRequestParamsColumn1786000000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "request_params" jsonb DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "request_params"`);
    }
}
exports.AddRequestParamsColumn1786000000000 = AddRequestParamsColumn1786000000000;
//# sourceMappingURL=1786000000000-AddRequestParamsColumn.js.map