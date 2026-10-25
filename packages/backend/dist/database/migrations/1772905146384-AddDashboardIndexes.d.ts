import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddDashboardIndexes1772905146384 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
