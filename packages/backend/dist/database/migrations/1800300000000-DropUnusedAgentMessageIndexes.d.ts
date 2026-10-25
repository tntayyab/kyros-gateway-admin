import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropUnusedAgentMessageIndexes1800300000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
