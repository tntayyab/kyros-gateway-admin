"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReclassifyPlanRequestLimitMessages1800100000000 = void 0;
class ReclassifyPlanRequestLimitMessages1800100000000 {
    name = 'ReclassifyPlanRequestLimitMessages1800100000000';
    async up(queryRunner) {
        await queryRunner.query(`
      UPDATE agent_messages
         SET routing_reason = 'plan_request_limit_exceeded',
             error_class = 'plan_request_limit_exceeded'
       WHERE error_origin = 'policy'
         AND error_class = 'limit_exceeded'
         AND routing_reason = 'limit_exceeded'
         AND error_http_status = 402
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      UPDATE agent_messages
         SET routing_reason = 'limit_exceeded',
             error_class = 'limit_exceeded'
       WHERE error_origin = 'policy'
         AND error_class = 'plan_request_limit_exceeded'
         AND routing_reason = 'plan_request_limit_exceeded'
         AND error_http_status = 402
    `);
    }
}
exports.ReclassifyPlanRequestLimitMessages1800100000000 = ReclassifyPlanRequestLimitMessages1800100000000;
//# sourceMappingURL=1800100000000-ReclassifyPlanRequestLimitMessages.js.map