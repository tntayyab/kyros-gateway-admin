import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAgentMessagesAutofixAttemptIndex1802700000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    private static readonly INDEX;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private indexIsInvalid;
}
