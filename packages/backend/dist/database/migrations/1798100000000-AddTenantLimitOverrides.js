"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTenantLimitOverrides1798100000000 = void 0;
class AddTenantLimitOverrides1798100000000 {
    name = 'AddTenantLimitOverrides1798100000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "limit_overrides" jsonb`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "limit_overrides"`);
    }
}
exports.AddTenantLimitOverrides1798100000000 = AddTenantLimitOverrides1798100000000;
//# sourceMappingURL=1798100000000-AddTenantLimitOverrides.js.map