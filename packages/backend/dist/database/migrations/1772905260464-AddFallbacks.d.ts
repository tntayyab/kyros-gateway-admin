import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddFallbacks1772905260464 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
