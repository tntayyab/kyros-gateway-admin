import type { QueryRunner } from 'typeorm';
export interface InPlaceIndex {
    table: string;
    index: string;
    build: string;
    key: string;
    include: string;
}
export declare function rebuildIndexInPlace(queryRunner: QueryRunner, spec: InPlaceIndex, target: 'covering' | 'plain'): Promise<void>;
