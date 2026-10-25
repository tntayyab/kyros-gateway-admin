"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddErrorHttpStatus1775000000000 = void 0;
const typeorm_1 = require("typeorm");
class AddErrorHttpStatus1775000000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('agent_messages', new typeorm_1.TableColumn({
            name: 'error_http_status',
            type: 'integer',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('agent_messages', 'error_http_status');
    }
}
exports.AddErrorHttpStatus1775000000000 = AddErrorHttpStatus1775000000000;
//# sourceMappingURL=1775000000000-AddErrorHttpStatus.js.map