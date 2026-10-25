"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddKeyPrefixIndex1773900000000 = void 0;
class AddKeyPrefixIndex1773900000000 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_api_keys_key_prefix" ON "agent_api_keys" ("key_prefix")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_api_keys_key_prefix" ON "api_keys" ("key_prefix")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_api_keys_key_prefix"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_api_keys_key_prefix"`);
    }
}
exports.AddKeyPrefixIndex1773900000000 = AddKeyPrefixIndex1773900000000;
//# sourceMappingURL=1773900000000-AddKeyPrefixIndex.js.map