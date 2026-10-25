"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPerformanceIndexes1772843035514 = void 0;
const crypto_util_1 = require("../../common/utils/crypto.util");
class AddPerformanceIndexes1772843035514 {
    name = 'AddPerformanceIndexes1772843035514';
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_user_id_timestamp" ON "agent_messages" ("user_id", "timestamp")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_tenant_agent_name_ts" ON "agent_messages" ("tenant_id", "agent_name", "timestamp")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_timestamp" ON "agent_messages" ("timestamp")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_security_event_user_id_timestamp" ON "security_event" ("user_id", "timestamp")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cost_snapshots_tenant_agent_time" ON "cost_snapshots" ("tenant_id", "agent_id", "snapshot_time")`);
        await queryRunner.query(`ALTER TABLE "user_providers" ADD COLUMN "key_prefix" varchar DEFAULT NULL`);
        await this.backfillKeyPrefix(queryRunner);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_providers" DROP COLUMN "key_prefix"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cost_snapshots_tenant_agent_time"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_security_event_user_id_timestamp"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_timestamp"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_tenant_agent_name_ts"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_user_id_timestamp"`);
    }
    async backfillKeyPrefix(queryRunner) {
        const log = queryRunner.connection.logger;
        let secret;
        try {
            secret = (0, crypto_util_1.getEncryptionSecret)();
        }
        catch {
            log.log('warn', 'AddPerformanceIndexes: No encryption secret found. Skipping key_prefix backfill.');
            return;
        }
        const rows = await queryRunner.query(`SELECT id, api_key_encrypted FROM "user_providers" WHERE api_key_encrypted IS NOT NULL AND api_key_encrypted != ''`);
        let backfilled = 0;
        for (const row of rows) {
            let prefix;
            try {
                const plaintext = (0, crypto_util_1.decrypt)(row.api_key_encrypted, secret);
                prefix = plaintext.substring(0, 8);
            }
            catch {
                continue;
            }
            await queryRunner.query(`UPDATE "user_providers" SET key_prefix = $1 WHERE id = $2`, [
                prefix,
                row.id,
            ]);
            backfilled++;
        }
        if (backfilled > 0) {
            log.log('info', `AddPerformanceIndexes: Backfilled key_prefix for ${backfilled} provider(s).`);
        }
    }
}
exports.AddPerformanceIndexes1772843035514 = AddPerformanceIndexes1772843035514;
//# sourceMappingURL=1772843035514-AddPerformanceIndexes.js.map