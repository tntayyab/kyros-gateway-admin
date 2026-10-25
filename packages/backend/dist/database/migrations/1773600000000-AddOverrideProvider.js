"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOverrideProvider1773600000000 = void 0;
const typeorm_1 = require("typeorm");
class AddOverrideProvider1773600000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('tier_assignments', new typeorm_1.TableColumn({
            name: 'override_provider',
            type: 'varchar',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('tier_assignments', 'override_provider');
    }
}
exports.AddOverrideProvider1773600000000 = AddOverrideProvider1773600000000;
//# sourceMappingURL=1773600000000-AddOverrideProvider.js.map