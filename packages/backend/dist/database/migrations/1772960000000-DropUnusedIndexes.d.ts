import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropUnusedIndexes1772960000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
