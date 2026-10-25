"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddErrorClassification1798000000000 = void 0;
const ERROR_ORIGIN_CASE = `CASE
  WHEN m.routing_reason = 'no_provider' THEN 'config'
  WHEN m.routing_reason = 'no_provider_key' THEN 'config'
  WHEN m.routing_reason = 'limit_exceeded' THEN 'policy'
  WHEN m.routing_reason = 'plan_request_limit_exceeded' THEN 'policy'
  WHEN m.routing_reason = 'manifest_rate_limited' THEN 'policy'
  WHEN m.routing_reason = 'friendly_error' THEN 'internal'
  WHEN m.status = 'rate_limited' THEN 'provider'
  WHEN m.error_http_status = 504 THEN 'transport'
  WHEN m.error_http_status = 503 THEN 'transport'
  WHEN m.error_http_status IS NOT NULL THEN 'provider'
  ELSE 'transport'
END`;
const ERROR_CLASS_CASE = `CASE
  WHEN m.routing_reason = 'no_provider' THEN 'no_provider'
  WHEN m.routing_reason = 'no_provider_key' THEN 'no_provider_key'
  WHEN m.routing_reason = 'limit_exceeded' AND m.error_http_status = 402 THEN 'plan_request_limit_exceeded'
  WHEN m.routing_reason = 'limit_exceeded' THEN 'limit_exceeded'
  WHEN m.routing_reason = 'plan_request_limit_exceeded' THEN 'plan_request_limit_exceeded'
  WHEN m.routing_reason = 'manifest_rate_limited' THEN 'rate_limit'
  WHEN m.routing_reason = 'friendly_error' THEN 'internal'
  WHEN m.status = 'rate_limited' THEN 'rate_limit'
  WHEN m.error_http_status = 504 THEN 'timeout'
  WHEN m.error_http_status = 503 THEN 'network'
  WHEN m.error_http_status = 429 THEN 'rate_limit'
  WHEN m.error_http_status = 402 THEN 'billing'
  WHEN m.error_http_status IN (401, 403) THEN 'auth'
  WHEN m.error_http_status = 404 THEN 'not_found'
  WHEN m.error_http_status = 413 THEN 'payload_too_large'
  WHEN m.error_http_status IN (400, 422) THEN 'invalid_request'
  WHEN m.error_http_status >= 500 THEN 'server_error'
  WHEN m.error_http_status >= 400 THEN 'client_error'
  WHEN m.error_http_status IS NOT NULL THEN 'server_error'
  ELSE 'network'
END`;
const NON_OK_STATUSES = `('error', 'fallback_error', 'rate_limited')`;
const BACKFILL_BATCH_SQL = `
WITH batch AS (
  SELECT id FROM agent_messages
  WHERE status IN ${NON_OK_STATUSES} AND error_origin IS NULL
  LIMIT 20000
)
UPDATE agent_messages AS m SET
  superseded = (m.status = 'fallback_error'),
  error_origin = ${ERROR_ORIGIN_CASE},
  error_class = ${ERROR_CLASS_CASE}
FROM batch
WHERE m.id = batch.id`;
const REMAINING_SQL = `SELECT EXISTS (
  SELECT 1 FROM agent_messages WHERE status IN ${NON_OK_STATUSES} AND error_origin IS NULL
) AS more`;
const MAX_BACKFILL_PASSES = 100_000;
class AddErrorClassification1798000000000 {
    name = 'AddErrorClassification1798000000000';
    transaction = false;
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "error_origin" varchar`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "error_class" varchar`);
        await queryRunner.query(`ALTER TABLE "agent_messages" ADD COLUMN IF NOT EXISTS "superseded" boolean NOT NULL DEFAULT false`);
        for (let pass = 0; pass < MAX_BACKFILL_PASSES; pass++) {
            await queryRunner.query(BACKFILL_BATCH_SQL);
            const remaining = (await queryRunner.query(REMAINING_SQL));
            if (!remaining?.[0]?.more)
                break;
        }
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_error_origin"`);
        await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_agent_messages_error_origin" ON "agent_messages" ("tenant_id", "timestamp") WHERE "error_origin" IS NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_agent_messages_error_origin"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "superseded"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "error_class"`);
        await queryRunner.query(`ALTER TABLE "agent_messages" DROP COLUMN IF EXISTS "error_origin"`);
    }
}
exports.AddErrorClassification1798000000000 = AddErrorClassification1798000000000;
//# sourceMappingURL=1798000000000-AddErrorClassification.js.map