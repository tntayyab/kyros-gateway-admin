import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAutofixPhoenixIds1799000200000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
