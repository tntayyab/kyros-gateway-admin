"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveRecordingsToProviderAttempts1801400000000 = void 0;
class MoveRecordingsToProviderAttempts1801400000000 {
    name = 'MoveRecordingsToProviderAttempts1801400000000';
    async up(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "request_recordings"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "recording_key" varchar`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "recording_key"`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "request_recordings" (
        "request_id" varchar NOT NULL,
        "storage_key" varchar NOT NULL,
        "storage_backend" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "api_format" varchar NOT NULL,
        "content_encoding" varchar NOT NULL DEFAULT 'gzip',
        "size_bytes" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_request_recordings_storage_backend"
          CHECK ("storage_backend" IN ('filesystem', 's3')),
        CONSTRAINT "CHK_request_recordings_status"
          CHECK ("status" IN ('pending', 'ready', 'failed')),
        CONSTRAINT "CHK_request_recordings_content_encoding"
          CHECK ("content_encoding" = 'gzip'),
        CONSTRAINT "PK_request_recordings" PRIMARY KEY ("request_id"),
        CONSTRAINT "FK_request_recordings_request"
          FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT
      )
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_request_recordings_created_at" ON "request_recordings" ("created_at")`);
    }
}
exports.MoveRecordingsToProviderAttempts1801400000000 = MoveRecordingsToProviderAttempts1801400000000;
//# sourceMappingURL=1801400000000-MoveRecordingsToProviderAttempts.js.map