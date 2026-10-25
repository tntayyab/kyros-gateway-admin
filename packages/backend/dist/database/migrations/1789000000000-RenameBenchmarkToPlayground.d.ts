import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class RenameBenchmarkToPlayground1789000000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
