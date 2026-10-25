import { MigrationInterface, QueryRunner } from 'typeorm';
import { InPlaceIndex } from '../index-rebuild';
export declare class CoverRequestsLogFilters1803000000000 implements MigrationInterface {
    name: string;
    transaction: boolean;
    static readonly REQUESTS_INDEX: InPlaceIndex;
    static readonly FALLBACK_INDEX = "IDX_agent_messages_fallback_window";
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private dropIfInvalid;
}
