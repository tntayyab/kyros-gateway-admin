import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddTenantProviderValueIndex1793000000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
