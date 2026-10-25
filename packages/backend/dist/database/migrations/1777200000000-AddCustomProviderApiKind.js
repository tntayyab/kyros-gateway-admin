"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomProviderApiKind1777200000000 = void 0;
const typeorm_1 = require("typeorm");
class AddCustomProviderApiKind1777200000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('custom_providers', new typeorm_1.TableColumn({
            name: 'api_kind',
            type: 'varchar',
            isNullable: false,
            default: "'openai'",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('custom_providers', 'api_kind');
    }
}
exports.AddCustomProviderApiKind1777200000000 = AddCustomProviderApiKind1777200000000;
//# sourceMappingURL=1777200000000-AddCustomProviderApiKind.js.map