"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropSecurityEventTable1773700000000 = void 0;
class DropSecurityEventTable1773700000000 {
    async up(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "security_event"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "security_event" (
        "id" varchar PRIMARY KEY NOT NULL,
        "session_key" varchar,
        "timestamp" timestamp NOT NULL,
        "severity" varchar NOT NULL,
        "category" varchar NOT NULL,
        "description" varchar NOT NULL,
        "user_id" varchar
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_security_event_user_id_timestamp" ON "security_event" ("user_id", "timestamp")`);
    }
}
exports.DropSecurityEventTable1773700000000 = DropSecurityEventTable1773700000000;
//# sourceMappingURL=1773700000000-DropSecurityEventTable.js.map