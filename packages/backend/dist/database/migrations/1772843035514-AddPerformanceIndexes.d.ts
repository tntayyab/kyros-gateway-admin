import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddPerformanceIndexes1772843035514 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private backfillKeyPrefix;
}
