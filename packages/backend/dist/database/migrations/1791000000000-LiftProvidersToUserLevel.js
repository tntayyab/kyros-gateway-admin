"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiftProvidersToUserLevel1791000000000 = void 0;
class LiftProvidersToUserLevel1791000000000 {
    name = 'LiftProvidersToUserLevel1791000000000';
    async up(queryRunner) {
        await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "agent_provider_access" (
      "agent_id" varchar NOT NULL,
      "user_provider_id" varchar NOT NULL,
      CONSTRAINT "PK_agent_provider_access"
        PRIMARY KEY ("agent_id", "user_provider_id")
    )
  `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_agent_provider_access_provider" ON "agent_provider_access" ("user_provider_id")`);
        await queryRunner.query(`
    ALTER TABLE "agent_provider_access"
      ADD CONSTRAINT "FK_agent_provider_access_agent"
      FOREIGN KEY ("agent_id") REFERENCES "agents" ("id") ON DELETE CASCADE
  `);
        await queryRunner.query(`
    ALTER TABLE "agent_provider_access"
      ADD CONSTRAINT "FK_agent_provider_access_provider"
      FOREIGN KEY ("user_provider_id") REFERENCES "user_providers" ("id") ON DELETE CASCADE
  `);
        await queryRunner.query(`
    INSERT INTO "agent_provider_access" ("agent_id", "user_provider_id")
    SELECT "agent_id", "id"
    FROM "user_providers"
    WHERE "agent_id" IS NOT NULL
      AND EXISTS (SELECT 1 FROM "agents" a WHERE a."id" = "user_providers"."agent_id")
    ON CONFLICT DO NOTHING
  `);
        await queryRunner.query(`ALTER TABLE "user_providers" ALTER COLUMN "agent_id" DROP NOT NULL`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_agent_provider_auth_label"`);
        await queryRunner.query(`
    WITH colliding_labels AS (
      SELECT "user_id", "provider", "auth_type", LOWER("label") AS "label_key"
      FROM "user_providers"
      WHERE "user_id" IS NOT NULL AND "label" IS NOT NULL
      GROUP BY "user_id", "provider", "auth_type", LOWER("label")
      HAVING COUNT(*) > 1
    ),
    agent_labels AS (
      SELECT
        up."id",
        up."user_id",
        up."provider",
        up."auth_type",
        up."label",
        up."priority",
        up."connected_at",
        COALESCE(
          NULLIF(TRIM(a."display_name"), ''),
          NULLIF(TRIM(a."name"), ''),
          up."agent_id",
          up."id"
        ) AS "agent_label"
      FROM "user_providers" up
      JOIN colliding_labels c
        ON c."user_id" = up."user_id"
        AND c."provider" = up."provider"
        AND c."auth_type" IS NOT DISTINCT FROM up."auth_type"
        AND c."label_key" = LOWER(up."label")
      LEFT JOIN "agents" a ON a."id" = up."agent_id"
    ),
    proposed AS (
      SELECT
        "id",
        "user_id",
        "provider",
        "auth_type",
        "priority",
        "connected_at",
        CASE
          WHEN LOWER("label") = 'default' THEN 'from ' || "agent_label"
          ELSE "label" || ' (from ' || "agent_label" || ')'
        END AS "proposed_label"
      FROM agent_labels
    ),
    ranked AS (
      SELECT
        p.*,
        COUNT(*) OVER (
          PARTITION BY p."user_id", p."provider", p."auth_type", LOWER(p."proposed_label")
        ) AS "proposed_count",
        EXISTS (
          SELECT 1
          FROM "user_providers" existing
          WHERE existing."user_id" = p."user_id"
            AND existing."provider" = p."provider"
            AND existing."auth_type" IS NOT DISTINCT FROM p."auth_type"
            AND LOWER(existing."label") = LOWER(p."proposed_label")
            AND NOT EXISTS (
              SELECT 1 FROM proposed p2 WHERE p2."id" = existing."id"
            )
        ) AS "collides_with_existing"
      FROM proposed p
    ),
    candidate_reserved_labels AS (
      SELECT
        "id",
        "user_id",
        "provider",
        "auth_type",
        LOWER("proposed_label") AS "label_key"
      FROM proposed
      UNION ALL
      SELECT
        p."id",
        p."user_id",
        p."provider",
        p."auth_type",
        LOWER(
          CASE
            WHEN suffix.n = 1 THEN p."proposed_label" || ' [' || p."id" || ']'
            ELSE p."proposed_label" || ' [' || p."id" || '-' || suffix.n || ']'
          END
        ) AS "label_key"
      FROM proposed p
      CROSS JOIN generate_series(1, 1000) AS suffix(n)
    ),
    resolved AS (
      SELECT ranked."id", chosen."label"
      FROM ranked
      CROSS JOIN LATERAL (
        SELECT CASE
          WHEN suffix.n = 0 THEN ranked."proposed_label"
          WHEN suffix.n = 1 THEN ranked."proposed_label" || ' [' || ranked."id" || ']'
          ELSE ranked."proposed_label" || ' [' || ranked."id" || '-' || suffix.n || ']'
        END AS "label"
        FROM generate_series(0, 1000) AS suffix(n)
        WHERE (
          suffix.n > 0
          OR (ranked."proposed_count" = 1 AND NOT ranked."collides_with_existing")
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "user_providers" existing
          WHERE existing."user_id" = ranked."user_id"
            AND existing."provider" = ranked."provider"
            AND existing."auth_type" IS NOT DISTINCT FROM ranked."auth_type"
            AND NOT EXISTS (
              SELECT 1 FROM proposed p2 WHERE p2."id" = existing."id"
            )
            AND LOWER(existing."label") = LOWER(
              CASE
                WHEN suffix.n = 0 THEN ranked."proposed_label"
                WHEN suffix.n = 1 THEN ranked."proposed_label" || ' [' || ranked."id" || ']'
                ELSE ranked."proposed_label" || ' [' || ranked."id" || '-' || suffix.n || ']'
              END
            )
        )
        AND NOT EXISTS (
          SELECT 1
          FROM candidate_reserved_labels reserved
          WHERE reserved."id" <> ranked."id"
            AND reserved."user_id" = ranked."user_id"
            AND reserved."provider" = ranked."provider"
            AND reserved."auth_type" IS NOT DISTINCT FROM ranked."auth_type"
            AND reserved."label_key" = LOWER(
              CASE
                WHEN suffix.n = 0 THEN ranked."proposed_label"
                WHEN suffix.n = 1 THEN ranked."proposed_label" || ' [' || ranked."id" || ']'
                ELSE ranked."proposed_label" || ' [' || ranked."id" || '-' || suffix.n || ']'
              END
            )
        )
        ORDER BY suffix.n
        LIMIT 1
      ) chosen
    )
    UPDATE "user_providers" up
    SET "label" = resolved."label"
    FROM resolved
    WHERE up."id" = resolved."id"
  `);
        await queryRunner.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_providers_user_provider_auth_label"
    ON "user_providers" ("user_id", "provider", "auth_type", LOWER("label"))
  `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_providers_user_provider_auth_label"`);
        await queryRunner.query(`
    WITH ranked_grants AS (
      SELECT
        apa."user_provider_id",
        apa."agent_id",
        ROW_NUMBER() OVER (
          PARTITION BY apa."user_provider_id"
          ORDER BY apa."agent_id"
        ) AS rn
      FROM "agent_provider_access" apa
      JOIN "user_providers" up ON up."id" = apa."user_provider_id"
      WHERE up."agent_id" IS NULL
    )
    INSERT INTO "user_providers" (
      "id",
      "user_id",
      "agent_id",
      "provider",
      "api_key_encrypted",
      "key_prefix",
      "auth_type",
      "label",
      "priority",
      "region",
      "is_active",
      "connected_at",
      "updated_at",
      "cached_models",
      "models_fetched_at"
    )
    SELECT
      up."id" || ':' || ranked_grants."agent_id",
      up."user_id",
      ranked_grants."agent_id",
      up."provider",
      up."api_key_encrypted",
      up."key_prefix",
      up."auth_type",
      up."label",
      up."priority",
      up."region",
      up."is_active",
      up."connected_at",
      up."updated_at",
      up."cached_models",
      up."models_fetched_at"
    FROM ranked_grants
    JOIN "user_providers" up ON up."id" = ranked_grants."user_provider_id"
    WHERE ranked_grants.rn > 1
    ON CONFLICT ("id") DO NOTHING
  `);
        await queryRunner.query(`
    WITH first_grant AS (
      SELECT DISTINCT ON (apa."user_provider_id")
        apa."user_provider_id",
        apa."agent_id"
      FROM "agent_provider_access" apa
      JOIN "user_providers" up ON up."id" = apa."user_provider_id"
      WHERE up."agent_id" IS NULL
      ORDER BY apa."user_provider_id", apa."agent_id"
    )
    UPDATE "user_providers" up
    SET "agent_id" = first_grant."agent_id"
    FROM first_grant
    WHERE up."id" = first_grant."user_provider_id"
      AND up."agent_id" IS NULL
  `);
        await queryRunner.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM "user_providers" WHERE "agent_id" IS NULL) THEN
        ALTER TABLE "user_providers" ALTER COLUMN "agent_id" SET NOT NULL;
      END IF;
    END $$
  `);
        await queryRunner.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_providers_agent_provider_auth_label"
    ON "user_providers" ("agent_id", "provider", "auth_type", LOWER("label"))
  `);
        await queryRunner.query(`ALTER TABLE "agent_provider_access" DROP CONSTRAINT IF EXISTS "FK_agent_provider_access_provider"`);
        await queryRunner.query(`ALTER TABLE "agent_provider_access" DROP CONSTRAINT IF EXISTS "FK_agent_provider_access_agent"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_provider_access_provider"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "agent_provider_access"`);
    }
}
exports.LiftProvidersToUserLevel1791000000000 = LiftProvidersToUserLevel1791000000000;
//# sourceMappingURL=1791000000000-LiftProvidersToUserLevel.js.map