"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentModelParams1787000000000 = void 0;
class AddAgentModelParams1787000000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_model_params" (
        "id" varchar PRIMARY KEY,
        "user_id" varchar NOT NULL,
        "agent_id" varchar NOT NULL,
        "provider" varchar NOT NULL,
        "auth_type" varchar NOT NULL,
        "model_name" varchar NOT NULL,
        "params" jsonb NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_agent_model_params_route"
      ON "agent_model_params" ("agent_id", "provider", "auth_type", "model_name")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_agent_model_params_agent"
      ON "agent_model_params" ("agent_id")
    `);
        const PROVIDERS_WITH_THINKING = ['deepseek'];
        for (const sourceTable of ['tier_assignments', 'specificity_assignments']) {
            await queryRunner.query(`
        WITH source_rows AS (
          SELECT
            t.user_id,
            t.agent_id,
            t.id AS source_id,
            t.param_defaults,
            -- effective primary: override wins over auto-assigned
            COALESCE(t.override_route, t.auto_assigned_route) AS primary_route,
            t.fallback_routes
          FROM "${sourceTable}" t
          WHERE t.param_defaults IS NOT NULL
            AND jsonb_typeof(t.param_defaults) = 'object'
        ),
        primary_rows AS (
          SELECT
            s.user_id,
            s.agent_id,
            s.source_id,
            s.param_defaults,
            (s.primary_route->>'provider') AS provider,
            (s.primary_route->>'authType') AS auth_type,
            (s.primary_route->>'model') AS model_name,
            0 AS slot_priority
          FROM source_rows s
          WHERE s.primary_route IS NOT NULL
            AND jsonb_typeof(s.primary_route) = 'object'
            AND s.primary_route ? 'provider'
            AND s.primary_route ? 'authType'
            AND s.primary_route ? 'model'
        ),
        fallback_rows AS (
          SELECT
            s.user_id,
            s.agent_id,
            s.source_id,
            s.param_defaults,
            (fr->>'provider') AS provider,
            (fr->>'authType') AS auth_type,
            (fr->>'model') AS model_name,
            1 + (fr_idx - 1) AS slot_priority
          FROM source_rows s
          CROSS JOIN LATERAL jsonb_array_elements(s.fallback_routes)
            WITH ORDINALITY AS arr(fr, fr_idx)
          WHERE s.fallback_routes IS NOT NULL
            AND jsonb_typeof(s.fallback_routes) = 'array'
            AND jsonb_typeof(fr) = 'object'
            AND fr ? 'provider'
            AND fr ? 'authType'
            AND fr ? 'model'
        ),
        combined AS (
          SELECT * FROM primary_rows
          UNION ALL
          SELECT * FROM fallback_rows
        ),
        compatible AS (
          -- Keep rows where the route's provider consumes at least one key
          -- in the param_defaults blob. Today only DeepSeek consumes
          -- thinking; expand the OR chain when new provider/key pairs
          -- land. Filter at the row level (not per-key) because the JSONB
          -- column is a wide bag and the runtime cleanly ignores keys it
          -- doesn't recognize.
          SELECT
            user_id,
            agent_id,
            source_id,
            param_defaults,
            LOWER(provider) AS provider,
            auth_type,
            model_name,
            slot_priority
          FROM combined
          WHERE LOWER(provider) IN (${PROVIDERS_WITH_THINKING.map((p) => `'${p}'`).join(', ')})
            AND param_defaults ? 'thinking'
        ),
        deduped AS (
          SELECT
            user_id,
            agent_id,
            param_defaults,
            provider,
            auth_type,
            model_name,
            ROW_NUMBER() OVER (
              PARTITION BY agent_id, provider, auth_type, model_name
              ORDER BY slot_priority DESC, source_id DESC
            ) AS route_rank
          FROM compatible
        )
        INSERT INTO "agent_model_params" (
          "id",
          "user_id",
          "agent_id",
          "provider",
          "auth_type",
          "model_name",
          "params",
          "created_at",
          "updated_at"
        )
        SELECT
          gen_random_uuid()::text,
          user_id,
          agent_id,
          provider,
          auth_type,
          model_name,
          -- Project the blob to only the keys the route's provider consumes.
          -- For DeepSeek today, that's thinking. Anything else stays
          -- stripped so a stray legacy field can't poison outbound requests.
          jsonb_build_object('thinking', param_defaults->'thinking'),
          now(),
          now()
        FROM deduped
        WHERE route_rank = 1
        ON CONFLICT (agent_id, provider, auth_type, model_name)
        DO UPDATE SET
          params = EXCLUDED.params,
          updated_at = now()
      `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_agent_model_params_agent"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_agent_model_params_route"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "agent_model_params"`);
    }
}
exports.AddAgentModelParams1787000000000 = AddAgentModelParams1787000000000;
//# sourceMappingURL=1787000000000-AddAgentModelParams.js.map