"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLimitAction1772200000000 = void 0;
class AddLimitAction1772200000000 {
    name = 'AddLimitAction1772200000000';
    async up(queryRunner) {
        const result = await queryRunner.query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_rules' AND column_name = 'action'`);
        if (result.length === 0) {
            await queryRunner.query(`ALTER TABLE "notification_rules" ADD COLUMN "action" character varying NOT NULL DEFAULT 'notify'`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "notification_rules" DROP COLUMN IF EXISTS "action"`);
    }
}
exports.AddLimitAction1772200000000 = AddLimitAction1772200000000;
//# sourceMappingURL=1772200000000-AddLimitAction.js.map