import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddProviderAttemptOrdering1801100000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    up(queryRunner: QueryRunner): Promise<void>;
    private addAttemptOrdering;
    down(queryRunner: QueryRunner): Promise<void>;
}
