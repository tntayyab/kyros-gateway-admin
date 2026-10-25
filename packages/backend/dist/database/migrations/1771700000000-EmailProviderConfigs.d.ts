import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class EmailProviderConfigs1771700000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
