"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillLocalCustomProviders1777300000000 = void 0;
class BackfillLocalCustomProviders1777300000000 {
    name = 'BackfillLocalCustomProviders1777300000000';
    async up(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "user_providers" u
      WHERE u."provider" LIKE 'custom:%'
        AND u."auth_type" = 'api_key'
        AND EXISTS (
          SELECT 1 FROM "user_providers" v
          WHERE v."agent_id" = u."agent_id"
            AND v."provider" = u."provider"
            AND v."auth_type" = 'local'
        )
    `);
        await queryRunner.query(`
      UPDATE "user_providers" u
      SET "auth_type" = 'local'
      WHERE u."provider" LIKE 'custom:%'
        AND u."auth_type" = 'api_key'
        AND EXISTS (
          SELECT 1 FROM "custom_providers" cp
          WHERE ('custom:' || cp.id) = u."provider"
            AND LOWER(REGEXP_REPLACE(cp.name, '[[:space:]._-]+', '', 'g'))
                IN ('ollama', 'lmstudio', 'lmstudio')
        )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "user_providers" u
      WHERE u."provider" LIKE 'custom:%'
        AND u."auth_type" = 'local'
        AND EXISTS (
          SELECT 1 FROM "user_providers" v
          WHERE v."agent_id" = u."agent_id"
            AND v."provider" = u."provider"
            AND v."auth_type" = 'api_key'
        )
        AND EXISTS (
          SELECT 1 FROM "custom_providers" cp
          WHERE ('custom:' || cp.id) = u."provider"
            AND LOWER(REGEXP_REPLACE(cp.name, '[[:space:]._-]+', '', 'g'))
                IN ('ollama', 'lmstudio')
        )
    `);
        await queryRunner.query(`
      UPDATE "user_providers" u
      SET "auth_type" = 'api_key'
      WHERE u."provider" LIKE 'custom:%'
        AND u."auth_type" = 'local'
        AND EXISTS (
          SELECT 1 FROM "custom_providers" cp
          WHERE ('custom:' || cp.id) = u."provider"
            AND LOWER(REGEXP_REPLACE(cp.name, '[[:space:]._-]+', '', 'g'))
                IN ('ollama', 'lmstudio')
        )
    `);
    }
}
exports.BackfillLocalCustomProviders1777300000000 = BackfillLocalCustomProviders1777300000000;
//# sourceMappingURL=1777300000000-BackfillLocalCustomProviders.js.map