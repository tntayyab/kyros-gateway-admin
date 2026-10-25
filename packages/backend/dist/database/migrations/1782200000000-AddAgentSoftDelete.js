"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentSoftDelete1782200000000 = void 0;
class AddAgentSoftDelete1782200000000 {
    name = 'AddAgentSoftDelete1782200000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agents" ADD COLUMN "deleted_at" TIMESTAMP NULL`);
        const rows = await queryRunner.query(`SELECT indexname FROM pg_indexes
       WHERE tablename = 'agents' AND indexdef LIKE 'CREATE UNIQUE INDEX%(tenant_id, name)'`);
        for (const row of rows) {
            await queryRunner.query(`DROP INDEX IF EXISTS "${row.indexname}"`);
        }
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_agents_tenant_name_live"
         ON "agents" ("tenant_id", "name")
       WHERE "deleted_at" IS NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_agents_tenant_name_live"`);
        await queryRunner.query(`UPDATE "agents"
          SET "name" = "name" || '__deleted_' || "id"
        WHERE "deleted_at" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_agents_tenant_name" ON "agents" ("tenant_id", "name")`);
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "deleted_at"`);
    }
}
exports.AddAgentSoftDelete1782200000000 = AddAgentSoftDelete1782200000000;
//# sourceMappingURL=1782200000000-AddAgentSoftDelete.js.map