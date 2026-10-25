import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class TuneFactTableAutovacuum1802400000000 implements MigrationInterface {
    name: string;
    private static readonly SETTINGS;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
