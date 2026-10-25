"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropProviderRateLimits1791600000000 = void 0;
class DropProviderRateLimits1791600000000 {
    name = 'DropProviderRateLimits1791600000000';
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rate_limits_connection_latest"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "provider_rate_limits"`);
    }
    async down() {
    }
}
exports.DropProviderRateLimits1791600000000 = DropProviderRateLimits1791600000000;
//# sourceMappingURL=1791600000000-DropProviderRateLimits.js.map