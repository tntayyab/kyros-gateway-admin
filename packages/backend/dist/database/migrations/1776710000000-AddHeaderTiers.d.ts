import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddHeaderTiers1776710000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
