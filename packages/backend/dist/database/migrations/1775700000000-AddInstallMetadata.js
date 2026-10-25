"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInstallMetadata1775700000000 = void 0;
class AddInstallMetadata1775700000000 {
    name = 'AddInstallMetadata1775700000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "install_metadata" (
        "id" varchar NOT NULL,
        "install_id" varchar NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "first_send_at" timestamp DEFAULT NULL,
        "last_sent_at" timestamp DEFAULT NULL,
        CONSTRAINT "PK_install_metadata" PRIMARY KEY ("id")
      )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "install_metadata"`);
    }
}
exports.AddInstallMetadata1775700000000 = AddInstallMetadata1775700000000;
//# sourceMappingURL=1775700000000-AddInstallMetadata.js.map