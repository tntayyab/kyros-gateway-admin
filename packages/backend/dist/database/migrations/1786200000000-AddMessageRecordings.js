"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMessageRecordings1786200000000 = void 0;
class AddMessageRecordings1786200000000 {
    name = 'AddMessageRecordings1786200000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "recorded" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_messages_recorded" ON "agent_messages" ("tenant_id", "timestamp") WHERE "recorded" = true`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "message_recordings" (
        "message_id" varchar PRIMARY KEY REFERENCES "agent_messages"("id") ON DELETE CASCADE,
        "request_body" jsonb,
        "response_body" jsonb,
        "response_headers" jsonb,
        "size_bytes" integer,
        "created_at" timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "message_recordings"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_messages_recorded"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "recorded"`);
    }
}
exports.AddMessageRecordings1786200000000 = AddMessageRecordings1786200000000;
//# sourceMappingURL=1786200000000-AddMessageRecordings.js.map