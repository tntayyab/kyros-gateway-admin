"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashApiKeys1771500000000 = void 0;
const crypto_1 = require("crypto");
const HASH_SALT = 'manifest-api-key-salt';
const KEY_LENGTH = 32;
class HashApiKeys1771500000000 {
    name = 'HashApiKeys1771500000000';
    async up(queryRunner) {
        const columnExists = async (table, column) => {
            const result = await queryRunner.query(`SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`, [table, column]);
            return result.length > 0;
        };
        const indexExists = async (name) => {
            const result = await queryRunner.query(`SELECT 1 FROM pg_indexes WHERE indexname = $1`, [name]);
            return result.length > 0;
        };
        if (!(await columnExists('agent_api_keys', 'key_hash'))) {
            await queryRunner.query(`ALTER TABLE "agent_api_keys" ADD COLUMN "key_hash" character varying(64)`);
        }
        if (!(await columnExists('agent_api_keys', 'key_prefix'))) {
            await queryRunner.query(`ALTER TABLE "agent_api_keys" ADD COLUMN "key_prefix" character varying(12)`);
        }
        if (!(await columnExists('api_keys', 'key_hash'))) {
            await queryRunner.query(`ALTER TABLE "api_keys" ADD COLUMN "key_hash" character varying(64)`);
        }
        if (!(await columnExists('api_keys', 'key_prefix'))) {
            await queryRunner.query(`ALTER TABLE "api_keys" ADD COLUMN "key_prefix" character varying(12)`);
        }
        const agentKeys = await queryRunner.query(`SELECT id, key FROM "agent_api_keys" WHERE key IS NOT NULL AND key != ''`);
        for (const row of agentKeys) {
            const hash = (0, crypto_1.scryptSync)(row.key, HASH_SALT, KEY_LENGTH).toString('hex');
            const prefix = row.key.substring(0, 12);
            await queryRunner.query(`UPDATE "agent_api_keys" SET key_hash = $1, key_prefix = $2 WHERE id = $3`, [hash, prefix, row.id]);
        }
        const apiKeys = await queryRunner.query(`SELECT id, key FROM "api_keys" WHERE key IS NOT NULL AND key != ''`);
        for (const row of apiKeys) {
            const hash = (0, crypto_1.scryptSync)(row.key, HASH_SALT, KEY_LENGTH).toString('hex');
            const prefix = row.key.substring(0, 12);
            await queryRunner.query(`UPDATE "api_keys" SET key_hash = $1, key_prefix = $2 WHERE id = $3`, [hash, prefix, row.id]);
        }
        await queryRunner.query(`DELETE FROM "agent_api_keys" WHERE key_hash IS NULL AND (key IS NULL OR key = '')`);
        await queryRunner.query(`DELETE FROM "api_keys" WHERE key_hash IS NULL AND (key IS NULL OR key = '')`);
        await queryRunner.query(`ALTER TABLE "agent_api_keys" ALTER COLUMN "key_hash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "agent_api_keys" ALTER COLUMN "key_prefix" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_keys" ALTER COLUMN "key_hash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_keys" ALTER COLUMN "key_prefix" SET NOT NULL`);
        if (!(await indexExists('IDX_agent_api_keys_key_hash'))) {
            await queryRunner.query(`CREATE UNIQUE INDEX "IDX_agent_api_keys_key_hash" ON "agent_api_keys" ("key_hash")`);
        }
        if (!(await indexExists('IDX_api_keys_key_hash'))) {
            await queryRunner.query(`CREATE UNIQUE INDEX "IDX_api_keys_key_hash" ON "api_keys" ("key_hash")`);
        }
        if (await indexExists('IDX_9357d38f073722e36f2f281276')) {
            await queryRunner.query(`DROP INDEX "public"."IDX_9357d38f073722e36f2f281276"`);
        }
        await queryRunner.query(`ALTER TABLE "agent_api_keys" ALTER COLUMN "key" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_keys" ALTER COLUMN "key" DROP NOT NULL`);
        await queryRunner.query(`UPDATE "agent_api_keys" SET key = NULL`);
        await queryRunner.query(`UPDATE "api_keys" SET key = NULL`);
    }
    async down() {
        throw new Error('Irreversible migration: plaintext keys have been removed and cannot be recovered.');
    }
}
exports.HashApiKeys1771500000000 = HashApiKeys1771500000000;
//# sourceMappingURL=1771500000000-HashApiKeys.js.map