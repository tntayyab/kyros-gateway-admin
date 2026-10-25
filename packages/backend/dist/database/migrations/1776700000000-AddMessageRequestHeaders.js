"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMessageRequestHeaders1776700000000 = void 0;
class AddMessageRequestHeaders1776700000000 {
    name = 'AddMessageRequestHeaders1776700000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN "request_headers" text DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN "request_headers"`);
    }
}
exports.AddMessageRequestHeaders1776700000000 = AddMessageRequestHeaders1776700000000;
//# sourceMappingURL=1776700000000-AddMessageRequestHeaders.js.map