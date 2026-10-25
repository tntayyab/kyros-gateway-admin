import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddMessageErrorCode1800200000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
