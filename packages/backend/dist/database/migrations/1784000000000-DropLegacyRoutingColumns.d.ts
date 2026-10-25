import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropLegacyRoutingColumns1784000000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
