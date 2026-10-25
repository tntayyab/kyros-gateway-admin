import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddTenantRequestUsage1801300000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
