"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentType1775100000000 = void 0;
const typeorm_1 = require("typeorm");
class AddAgentType1775100000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('agents', new typeorm_1.TableColumn({
            name: 'agent_category',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.addColumn('agents', new typeorm_1.TableColumn({
            name: 'agent_platform',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.query(`UPDATE agents SET agent_category = 'personal', agent_platform = 'openclaw' WHERE agent_category IS NULL`);
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('agents', 'agent_platform');
        await queryRunner.dropColumn('agents', 'agent_category');
    }
}
exports.AddAgentType1775100000000 = AddAgentType1775100000000;
//# sourceMappingURL=1775100000000-AddAgentType.js.map