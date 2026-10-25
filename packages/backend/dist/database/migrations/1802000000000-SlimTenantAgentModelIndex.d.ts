import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class SlimTenantAgentModelIndex1802000000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    private static readonly OLD_INDEX;
    private static readonly NEW_INDEX;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private indexIsInvalid;
}
