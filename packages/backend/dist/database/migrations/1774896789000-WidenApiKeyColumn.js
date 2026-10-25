"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidenApiKeyColumn1774896789000 = void 0;
class WidenApiKeyColumn1774896789000 {
    name = 'WidenApiKeyColumn1774896789000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_api_keys" ALTER COLUMN "key" TYPE character varying(255)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_api_keys" ALTER COLUMN "key" TYPE character varying(64) USING left("key", 64)`);
    }
}
exports.WidenApiKeyColumn1774896789000 = WidenApiKeyColumn1774896789000;
//# sourceMappingURL=1774896789000-WidenApiKeyColumn.js.map