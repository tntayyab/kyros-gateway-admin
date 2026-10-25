import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddRequestApiMode1801720000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private withBoundedLockWait;
}
