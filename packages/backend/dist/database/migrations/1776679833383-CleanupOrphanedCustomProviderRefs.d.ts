import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CleanupOrphanedCustomProviderRefs1776679833383 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
    private cleanTable;
}
