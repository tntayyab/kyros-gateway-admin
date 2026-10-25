import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class ExtendDashboardCoveringIndex1801200000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    private static readonly USAGE_INDEX;
    private static readonly SWAP_INDEX;
    private static readonly LEGACY_V2_INDEX;
    private static readonly SKILLS_INDEX;
    private static readonly USAGE_INCLUDE;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private usageIndexConverged;
    private indexIsInvalid;
}
