"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutofixWaitlistSignups1799000000000 = void 0;
class AddAutofixWaitlistSignups1799000000000 {
    name = 'AddAutofixWaitlistSignups1799000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "autofix_waitlist_signups" (
        "id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "email" varchar NOT NULL,
        "source" varchar NOT NULL DEFAULT 'self-hosted',
        "signed_up_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_autofix_waitlist_signups" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_autofix_waitlist_signups_email" UNIQUE ("email")
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "autofix_waitlist_signups"`);
    }
}
exports.AddAutofixWaitlistSignups1799000000000 = AddAutofixWaitlistSignups1799000000000;
//# sourceMappingURL=1799000000000-AddAutofixWaitlistSignups.js.map