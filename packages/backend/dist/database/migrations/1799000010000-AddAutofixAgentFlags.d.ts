import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAutofixAgentFlags1799000010000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
