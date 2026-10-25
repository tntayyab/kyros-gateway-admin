"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuneAgentMessagesAutovacuum1792900000000 = void 0;
class TuneAgentMessagesAutovacuum1792900000000 {
    name = 'TuneAgentMessagesAutovacuum1792900000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" SET (
        autovacuum_vacuum_scale_factor = 0.02,
        autovacuum_analyze_scale_factor = 0.01,
        autovacuum_vacuum_insert_scale_factor = 0.02
      )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_messages" RESET (
        autovacuum_vacuum_scale_factor,
        autovacuum_analyze_scale_factor,
        autovacuum_vacuum_insert_scale_factor
      )`);
    }
}
exports.TuneAgentMessagesAutovacuum1792900000000 = TuneAgentMessagesAutovacuum1792900000000;
//# sourceMappingURL=1792900000000-TuneAgentMessagesAutovacuum.js.map