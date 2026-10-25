import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddRequestsAndProviderAttempts1801000000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    up(queryRunner: QueryRunner): Promise<void>;
    private addRequestSchema;
    down(queryRunner: QueryRunner): Promise<void>;
}
