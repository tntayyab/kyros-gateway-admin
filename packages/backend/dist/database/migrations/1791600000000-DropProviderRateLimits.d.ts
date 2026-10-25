import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropProviderRateLimits1791600000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
