import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropRedundantIndexes1772940000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
