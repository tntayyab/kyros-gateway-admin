"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameIsSystemToIsPlayground1791900000000 = void 0;
class RenameIsSystemToIsPlayground1791900000000 {
    name = 'RenameIsSystemToIsPlayground1791900000000';
    async up(queryRunner) {
        await queryRunner.query(`DO $$ BEGIN
         IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'agents' AND column_name = 'is_system'
         ) THEN
           ALTER TABLE "agents" RENAME COLUMN "is_system" TO "is_playground";
         END IF;
       END $$`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DO $$ BEGIN
         IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'agents' AND column_name = 'is_playground'
         ) THEN
           ALTER TABLE "agents" RENAME COLUMN "is_playground" TO "is_system";
         END IF;
       END $$`);
    }
}
exports.RenameIsSystemToIsPlayground1791900000000 = RenameIsSystemToIsPlayground1791900000000;
//# sourceMappingURL=1791900000000-RenameIsSystemToIsPlayground.js.map