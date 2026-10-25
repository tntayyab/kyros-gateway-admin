"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMessageErrorCode1800200000000 = void 0;
class AddMessageErrorCode1800200000000 {
    name = 'AddMessageErrorCode1800200000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE agent_messages ADD COLUMN error_code varchar(8)`);
        await queryRunner.query(`
      UPDATE agent_messages
         SET error_code = CASE
               WHEN routing_reason = 'no_provider' THEN 'M101'
               WHEN routing_reason = 'no_provider_key' THEN 'M100'
               WHEN routing_reason = 'plan_request_limit_exceeded' THEN 'M204'
               WHEN routing_reason = 'limit_exceeded' AND error_http_status = 402 THEN 'M204'
               WHEN routing_reason = 'limit_exceeded' THEN 'M200'
               WHEN routing_reason = 'friendly_error' THEN 'M500'
             END
       WHERE routing_reason IN (
               'no_provider', 'no_provider_key', 'plan_request_limit_exceeded',
               'limit_exceeded', 'friendly_error'
             )
    `);
        await queryRunner.query(`
      UPDATE agent_messages
         SET model = NULL, provider = NULL, routing_tier = NULL
       WHERE provider = 'manifest'
         AND status IS DISTINCT FROM 'ok'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE agent_messages DROP COLUMN error_code`);
    }
}
exports.AddMessageErrorCode1800200000000 = AddMessageErrorCode1800200000000;
//# sourceMappingURL=1800200000000-AddMessageErrorCode.js.map