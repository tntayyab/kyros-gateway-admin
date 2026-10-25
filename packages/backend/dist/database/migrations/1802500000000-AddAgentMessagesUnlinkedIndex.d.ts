import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAgentMessagesUnlinkedIndex1802500000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    private static readonly INDEX;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private indexIsInvalid;
}
