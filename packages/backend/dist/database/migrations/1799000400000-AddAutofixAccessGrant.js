"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutofixAccessGrant1799000400000 = void 0;
class AddAutofixAccessGrant1799000400000 {
    name = 'AddAutofixAccessGrant1799000400000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN "autofix_access_granted_at" TIMESTAMP WITH TIME ZONE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "autofix_access_granted_at"`);
    }
}
exports.AddAutofixAccessGrant1799000400000 = AddAutofixAccessGrant1799000400000;
//# sourceMappingURL=1799000400000-AddAutofixAccessGrant.js.map