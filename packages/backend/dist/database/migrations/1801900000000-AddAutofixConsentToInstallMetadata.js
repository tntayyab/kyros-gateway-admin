"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutofixConsentToInstallMetadata1801900000000 = void 0;
class AddAutofixConsentToInstallMetadata1801900000000 {
    name = 'AddAutofixConsentToInstallMetadata1801900000000';
    async up(queryRunner) {
        await queryRunner.query(`SET LOCAL lock_timeout = '5s'`);
        await queryRunner.query(`ALTER TABLE "install_metadata" ADD COLUMN IF NOT EXISTS "autofix_consented_at" timestamp DEFAULT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`SET LOCAL lock_timeout = '5s'`);
        await queryRunner.query(`ALTER TABLE "install_metadata" DROP COLUMN IF EXISTS "autofix_consented_at"`);
    }
}
exports.AddAutofixConsentToInstallMetadata1801900000000 = AddAutofixConsentToInstallMetadata1801900000000;
//# sourceMappingURL=1801900000000-AddAutofixConsentToInstallMetadata.js.map