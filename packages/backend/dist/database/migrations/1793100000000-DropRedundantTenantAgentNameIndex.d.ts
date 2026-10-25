import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropRedundantTenantAgentNameIndex1793100000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
