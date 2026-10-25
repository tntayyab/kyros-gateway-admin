"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRequestRecordings1801300000000 = void 0;
class AddRequestRecordings1801300000000 {
    name = 'AddRequestRecordings1801300000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "record_messages" boolean NOT NULL DEFAULT false`);
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "request_recordings"`);
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN IF EXISTS "record_messages"`);
    }
}
exports.AddRequestRecordings1801300000000 = AddRequestRecordings1801300000000;
//# sourceMappingURL=1801300000000-AddRequestRecordings.js.map