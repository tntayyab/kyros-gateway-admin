"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCliAuthCodeChallenge1801730000000 = void 0;
class AddCliAuthCodeChallenge1801730000000 {
    name = 'AddCliAuthCodeChallenge1801730000000';
    async up(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`ALTER TABLE "cli_auth_codes" ADD COLUMN IF NOT EXISTS "code_challenge" character varying(128)`);
            await queryRunner.query(`ALTER TABLE "cli_auth_codes" ADD COLUMN IF NOT EXISTS "code_challenge_method" character varying(10)`);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`SET lock_timeout = '5s'`);
        try {
            await queryRunner.query(`ALTER TABLE "cli_auth_codes" DROP COLUMN IF EXISTS "code_challenge_method"`);
            await queryRunner.query(`ALTER TABLE "cli_auth_codes" DROP COLUMN IF EXISTS "code_challenge"`);
        }
        finally {
            await queryRunner.query(`RESET lock_timeout`);
        }
    }
}
exports.AddCliAuthCodeChallenge1801730000000 = AddCliAuthCodeChallenge1801730000000;
//# sourceMappingURL=1801730000000-AddCliAuthCodeChallenge.js.map