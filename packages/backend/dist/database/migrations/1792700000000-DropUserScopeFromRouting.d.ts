import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropUserScopeFromRouting1792700000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
