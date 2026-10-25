import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAutofixMessageFields1799000100000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
