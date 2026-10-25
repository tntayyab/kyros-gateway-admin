import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class EncryptApiKeys1771900000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
