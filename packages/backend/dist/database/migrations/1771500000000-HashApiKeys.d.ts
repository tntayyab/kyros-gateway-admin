import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class HashApiKeys1771500000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
