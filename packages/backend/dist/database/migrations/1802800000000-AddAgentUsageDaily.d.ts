import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAgentUsageDaily1802800000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    private static readonly REQUEST_INDEX;
    private static readonly ATTEMPT_INDEX;
    private static readonly READ_INDEX;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private indexIsInvalid;
}
