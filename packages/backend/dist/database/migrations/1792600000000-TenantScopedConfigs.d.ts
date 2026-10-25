import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class TenantScopedConfigs1792600000000 implements MigrationInterface {
    private rescopeTable;
    up(queryRunner: QueryRunner): Promise<void>;
    private restoreUserScope;
    down(queryRunner: QueryRunner): Promise<void>;
}
