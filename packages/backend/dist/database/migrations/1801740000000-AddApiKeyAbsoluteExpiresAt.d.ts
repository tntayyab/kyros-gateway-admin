import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddApiKeyAbsoluteExpiresAt1801740000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
