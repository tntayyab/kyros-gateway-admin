"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNotificationEmailAndOptionalDomain1771800000000 = void 0;
class AddNotificationEmailAndOptionalDomain1771800000000 {
    name = 'AddNotificationEmailAndOptionalDomain1771800000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "email_provider_configs" ADD COLUMN "notification_email" character varying`);
        await queryRunner.query(`ALTER TABLE "email_provider_configs" ALTER COLUMN "domain" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "email_provider_configs" ALTER COLUMN "domain" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_provider_configs" DROP COLUMN "notification_email"`);
    }
}
exports.AddNotificationEmailAndOptionalDomain1771800000000 = AddNotificationEmailAndOptionalDomain1771800000000;
//# sourceMappingURL=1771800000000-AddNotificationEmailAndOptionalDomain.js.map