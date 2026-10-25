"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidenKeyHashColumn1774000000000 = void 0;
class WidenKeyHashColumn1774000000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_api_keys" ALTER COLUMN "key_hash" TYPE varchar(128)`);
        await queryRunner.query(`ALTER TABLE "api_keys" ALTER COLUMN "key_hash" TYPE varchar(128)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agent_api_keys" ALTER COLUMN "key_hash" TYPE varchar(64) USING left("key_hash", 64)`);
        await queryRunner.query(`ALTER TABLE "api_keys" ALTER COLUMN "key_hash" TYPE varchar(64) USING left("key_hash", 64)`);
    }
}
exports.WidenKeyHashColumn1774000000000 = WidenKeyHashColumn1774000000000;
//# sourceMappingURL=1774000000000-WidenKeyHashColumn.js.map