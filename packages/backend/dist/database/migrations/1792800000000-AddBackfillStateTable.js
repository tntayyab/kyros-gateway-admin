"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBackfillStateTable1792800000000 = void 0;
class AddBackfillStateTable1792800000000 {
    name = 'AddBackfillStateTable1792800000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "backfill_state" (
        "name" varchar NOT NULL,
        "completed_at" timestamp NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_backfill_state" PRIMARY KEY ("name")
      )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "backfill_state"`);
    }
}
exports.AddBackfillStateTable1792800000000 = AddBackfillStateTable1792800000000;
//# sourceMappingURL=1792800000000-AddBackfillStateTable.js.map