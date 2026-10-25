"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOverrideAuthType1773100000000 = void 0;
const typeorm_1 = require("typeorm");
class AddOverrideAuthType1773100000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('tier_assignments', new typeorm_1.TableColumn({
            name: 'override_auth_type',
            type: 'varchar',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('tier_assignments', 'override_auth_type');
    }
}
exports.AddOverrideAuthType1773100000000 = AddOverrideAuthType1773100000000;
//# sourceMappingURL=1773100000000-AddOverrideAuthType.js.map