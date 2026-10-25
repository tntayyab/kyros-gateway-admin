"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentApiKeyPrefixActiveIndex1790000000000 = void 0;
class AddAgentApiKeyPrefixActiveIndex1790000000000 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_api_keys_prefix_active" ON "agent_api_keys" ("key_prefix", "is_active")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_api_keys_prefix_active"`);
    }
}
exports.AddAgentApiKeyPrefixActiveIndex1790000000000 = AddAgentApiKeyPrefixActiveIndex1790000000000;
//# sourceMappingURL=1790000000000-AddAgentApiKeyPrefixActiveIndex.js.map