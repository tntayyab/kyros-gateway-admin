import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class RenameProviderAccessToEnabledProviders1791800000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
