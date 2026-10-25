"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMessageAuthType1773200000000 = void 0;
const typeorm_1 = require("typeorm");
class AddMessageAuthType1773200000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('agent_messages', new typeorm_1.TableColumn({
            name: 'auth_type',
            type: 'varchar',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('agent_messages', 'auth_type');
    }
}
exports.AddMessageAuthType1773200000000 = AddMessageAuthType1773200000000;
//# sourceMappingURL=1773200000000-AddMessageAuthType.js.map