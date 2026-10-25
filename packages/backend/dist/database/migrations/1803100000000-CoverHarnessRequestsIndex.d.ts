import { MigrationInterface, QueryRunner } from 'typeorm';
import { InPlaceIndex } from '../index-rebuild';
export declare class CoverHarnessRequestsIndex1803100000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    static readonly INDEX: InPlaceIndex;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
