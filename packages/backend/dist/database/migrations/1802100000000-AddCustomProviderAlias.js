"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomProviderAlias1802100000000 = void 0;
const manifest_shared_1 = require("manifest-shared");
class AddCustomProviderAlias1802100000000 {
    name = 'AddCustomProviderAlias1802100000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "custom_providers" ADD COLUMN IF NOT EXISTS "alias" varchar`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_custom_providers_tenant_alias" ON "custom_providers" ("tenant_id", LOWER("alias")) WHERE "alias" IS NOT NULL`);
        const rows = await queryRunner.query(`SELECT "id", "tenant_id", "name", "alias" FROM "custom_providers" ORDER BY "created_at" ASC, "id" ASC`);
        const taken = new Set();
        for (const row of rows) {
            if (row.alias)
                taken.add(`${row.tenant_id} ${row.alias.toLowerCase()}`);
        }
        for (const row of rows) {
            if (row.alias)
                continue;
            const alias = (0, manifest_shared_1.deriveCustomProviderAlias)(row.name);
            if (!alias || (0, manifest_shared_1.isReservedCustomProviderAlias)(alias))
                continue;
            const key = `${row.tenant_id} ${alias}`;
            if (taken.has(key))
                continue;
            taken.add(key);
            await queryRunner.query(`UPDATE "custom_providers" SET "alias" = $1 WHERE "id" = $2`, [
                alias,
                row.id,
            ]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_custom_providers_tenant_alias"`);
        await queryRunner.query(`ALTER TABLE "custom_providers" DROP COLUMN IF EXISTS "alias"`);
    }
}
exports.AddCustomProviderAlias1802100000000 = AddCustomProviderAlias1802100000000;
//# sourceMappingURL=1802100000000-AddCustomProviderAlias.js.map