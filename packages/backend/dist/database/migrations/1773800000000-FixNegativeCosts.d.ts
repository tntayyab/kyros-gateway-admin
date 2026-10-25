import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class FixNegativeCosts1773800000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(_queryRunner: QueryRunner): Promise<void>;
}
