"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiftCustomProvidersToUserLevel1791200000000 = void 0;
class LiftCustomProvidersToUserLevel1791200000000 {
    name = 'LiftCustomProvidersToUserLevel1791200000000';
    async up(queryRunner) {
        await queryRunner.query(`
      DO $$
      DECLARE c text;
      BEGIN
        FOR c IN
          SELECT conname FROM pg_constraint
          WHERE conrelid = '"custom_providers"'::regclass AND contype = 'f'
        LOOP
          EXECUTE format('ALTER TABLE "custom_providers" DROP CONSTRAINT %I', c);
        END LOOP;
      END $$
    `);
        await queryRunner.query(`
      DO $$
      DECLARE i text;
      BEGIN
        FOR i IN
          SELECT i.relname
          FROM pg_index ix
          JOIN pg_class t ON t.oid = ix.indrelid
          JOIN pg_class i ON i.oid = ix.indexrelid
          WHERE t.relname = 'custom_providers'
            AND ix.indisprimary = false
        LOOP
          EXECUTE format('DROP INDEX IF EXISTS %I', i);
        END LOOP;
      END $$
    `);
        await queryRunner.query(`
      WITH ranked AS (
        SELECT "id", "user_id", "name",
          ROW_NUMBER() OVER (
            PARTITION BY "user_id", LOWER("name")
            ORDER BY "created_at" ASC, "id" ASC
          ) AS rn
        FROM "custom_providers"
      ),
      to_relabel AS (
        SELECT "id", "user_id", "name" FROM ranked WHERE rn > 1
      ),
      resolved AS (
        SELECT r."id", chosen."name"
        FROM to_relabel r
        CROSS JOIN LATERAL (
          SELECT CASE
                   WHEN suffix.n = 0 THEN r."name" || ' [' || r."id" || ']'
                   ELSE r."name" || ' [' || r."id" || '-' || suffix.n || ']'
                 END AS "name"
          FROM generate_series(0, 1000) AS suffix(n)
          WHERE NOT EXISTS (
            SELECT 1 FROM "custom_providers" existing
            WHERE existing."user_id" = r."user_id"
              AND existing."id" <> r."id"
              AND LOWER(existing."name") = LOWER(
                CASE
                  WHEN suffix.n = 0 THEN r."name" || ' [' || r."id" || ']'
                  ELSE r."name" || ' [' || r."id" || '-' || suffix.n || ']'
                END
              )
          )
          ORDER BY suffix.n
          LIMIT 1
        ) chosen
      )
      UPDATE "custom_providers" cp
      SET "name" = resolved."name"
      FROM resolved
      WHERE cp."id" = resolved."id"
    `);
        await queryRunner.query(`ALTER TABLE "custom_providers" DROP COLUMN IF EXISTS "agent_id"`);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_custom_providers_user_name"
      ON "custom_providers" ("user_id", LOWER("name"))
    `);
        await queryRunner.query(`
      INSERT INTO "agent_provider_access" ("agent_id", "user_provider_id")
      SELECT a."id", up."id"
      FROM "user_providers" up
      JOIN "tenants" t ON t."name" = up."user_id"
      JOIN "agents" a ON a."tenant_id" = t."id" AND a."deleted_at" IS NULL
      WHERE up."provider" LIKE 'custom:%'
      ON CONFLICT DO NOTHING
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_custom_providers_user_name"`);
        await queryRunner.query(`ALTER TABLE "custom_providers" ADD COLUMN IF NOT EXISTS "agent_id" varchar`);
        await queryRunner.query(`
      UPDATE "custom_providers" cp
      SET "agent_id" = (
        SELECT apa."agent_id"
        FROM "user_providers" up
        JOIN "agent_provider_access" apa ON apa."user_provider_id" = up."id"
        WHERE up."provider" = 'custom:' || cp."id"
        ORDER BY apa."agent_id"
        LIMIT 1
      )
      WHERE cp."agent_id" IS NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "custom_providers"
        ADD CONSTRAINT "FK_custom_providers_agent"
        FOREIGN KEY ("agent_id") REFERENCES "agents" ("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_custom_providers_agent_name"
      ON "custom_providers" ("agent_id", "name")
    `);
    }
}
exports.LiftCustomProvidersToUserLevel1791200000000 = LiftCustomProvidersToUserLevel1791200000000;
//# sourceMappingURL=1791200000000-LiftCustomProvidersToUserLevel.js.map