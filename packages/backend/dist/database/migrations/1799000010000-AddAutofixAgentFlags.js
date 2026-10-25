"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutofixAgentFlags1799000010000 = void 0;
class AddAutofixAgentFlags1799000010000 {
    name = 'AddAutofixAgentFlags1799000010000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN "autofix_enabled" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "autofix_enabled"`);
    }
}
exports.AddAutofixAgentFlags1799000010000 = AddAutofixAgentFlags1799000010000;
//# sourceMappingURL=1799000010000-AddAutofixAgentFlags.js.map