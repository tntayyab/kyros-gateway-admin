import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAutofixConsentToInstallMetadata1801900000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
