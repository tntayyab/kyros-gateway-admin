"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgentDisplayName1772400000000 = void 0;
class AddAgentDisplayName1772400000000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE agents ADD COLUMN display_name varchar`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE agents DROP COLUMN display_name`);
    }
}
exports.AddAgentDisplayName1772400000000 = AddAgentDisplayName1772400000000;
//# sourceMappingURL=1772400000000-AddAgentDisplayName.js.map