"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropRedundantAgentApiKeyPrefixIndex1790400000000 = void 0;
class DropRedundantAgentApiKeyPrefixIndex1790400000000 {
    name = 'DropRedundantAgentApiKeyPrefixIndex1790400000000';
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_api_keys_key_prefix"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_api_keys_key_prefix" ON "agent_api_keys" ("key_prefix")`);
    }
}
exports.DropRedundantAgentApiKeyPrefixIndex1790400000000 = DropRedundantAgentApiKeyPrefixIndex1790400000000;
//# sourceMappingURL=1790400000000-DropRedundantAgentApiKeyPrefixIndex.js.map