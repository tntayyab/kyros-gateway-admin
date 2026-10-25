"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBillingEmailPreferences1798300000000 = void 0;
class AddBillingEmailPreferences1798300000000 {
    name = 'AddBillingEmailPreferences1798300000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "billing_email_preferences" jsonb`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "billing_email_preferences"`);
    }
}
exports.AddBillingEmailPreferences1798300000000 = AddBillingEmailPreferences1798300000000;
//# sourceMappingURL=1798300000000-AddBillingEmailPreferences.js.map