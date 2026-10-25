import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class BackfillTenantId1772948502780 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(_queryRunner: QueryRunner): Promise<void>;
}
