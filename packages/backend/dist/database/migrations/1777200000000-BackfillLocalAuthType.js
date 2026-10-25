"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillLocalAuthType1777200000000 = void 0;
class BackfillLocalAuthType1777200000000 {
    name = 'BackfillLocalAuthType1777200000000';
    async up(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "user_providers" u
      WHERE u."provider" IN ('ollama', 'lmstudio')
        AND u."auth_type" = 'api_key'
        AND EXISTS (
          SELECT 1 FROM "user_providers" v
          WHERE v."agent_id" = u."agent_id"
            AND v."provider" = u."provider"
            AND v."auth_type" = 'local'
        )
    `);
        await queryRunner.query(`
      UPDATE "user_providers"
      SET "auth_type" = 'local'
      WHERE "provider" IN ('ollama', 'lmstudio')
        AND "auth_type" = 'api_key'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "user_providers" u
      WHERE u."provider" IN ('ollama', 'lmstudio')
        AND u."auth_type" = 'local'
        AND EXISTS (
          SELECT 1 FROM "user_providers" v
          WHERE v."agent_id" = u."agent_id"
            AND v."provider" = u."provider"
            AND v."auth_type" = 'api_key'
        )
    `);
        await queryRunner.query(`
      UPDATE "user_providers"
      SET "auth_type" = 'api_key'
      WHERE "provider" IN ('ollama', 'lmstudio')
        AND "auth_type" = 'local'
    `);
    }
}
exports.BackfillLocalAuthType1777200000000 = BackfillLocalAuthType1777200000000;
//# sourceMappingURL=1777200000000-BackfillLocalAuthType.js.map