"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullablePricing1772682112419 = void 0;
class NullablePricing1772682112419 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE model_pricing ALTER COLUMN input_price_per_token DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE model_pricing ALTER COLUMN output_price_per_token DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE model_pricing SET input_price_per_token = 0 WHERE input_price_per_token IS NULL`);
        await queryRunner.query(`UPDATE model_pricing SET output_price_per_token = 0 WHERE output_price_per_token IS NULL`);
        await queryRunner.query(`ALTER TABLE model_pricing ALTER COLUMN input_price_per_token SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE model_pricing ALTER COLUMN output_price_per_token SET NOT NULL`);
    }
}
exports.NullablePricing1772682112419 = NullablePricing1772682112419;
//# sourceMappingURL=1772682112419-NullablePricing.js.map