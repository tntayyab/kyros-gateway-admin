"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProviderConfigs1771700000000 = void 0;
class EmailProviderConfigs1771700000000 {
    name = 'EmailProviderConfigs1771700000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "email_provider_configs" (
        "id" character varying NOT NULL,
        "user_id" character varying NOT NULL,
        "provider" character varying NOT NULL,
        "api_key_encrypted" character varying NOT NULL,
        "domain" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_email_provider_configs" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_email_provider_configs_user_id"
      ON "email_provider_configs" ("user_id")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_email_provider_configs_user_id"`);
        await queryRunner.query(`DROP TABLE "email_provider_configs"`);
    }
}
exports.EmailProviderConfigs1771700000000 = EmailProviderConfigs1771700000000;
//# sourceMappingURL=1771700000000-EmailProviderConfigs.js.map