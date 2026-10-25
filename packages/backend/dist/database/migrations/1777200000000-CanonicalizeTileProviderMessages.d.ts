import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CanonicalizeTileProviderMessages1777200000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
