"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutofixWaitlist1796000000000 = void 0;
class AddAutofixWaitlist1796000000000 {
    name = 'AddAutofixWaitlist1796000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN "autofix_waitlist_at" TIMESTAMP WITH TIME ZONE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "autofix_waitlist_at"`);
    }
}
exports.AddAutofixWaitlist1796000000000 = AddAutofixWaitlist1796000000000;
//# sourceMappingURL=1796000000000-AddAutofixWaitlist.js.map