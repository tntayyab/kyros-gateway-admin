import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class PurgeNonCuratedModels1772960000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
