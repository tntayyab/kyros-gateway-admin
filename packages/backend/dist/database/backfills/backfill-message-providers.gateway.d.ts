import { DataSource } from 'typeorm';
import { BackfillGateway, BackfillTimeouts } from './backfill-message-providers';
export declare const WINDOW_END_SQL = "\n  SELECT max(id) AS end_id\n  FROM (\n    SELECT id FROM \"agent_messages\" WHERE id > $1 ORDER BY id LIMIT $2\n  ) w\n";
export declare const PASS_1_SQL: string;
export declare const PASS_2_SQL: string;
export declare const PASS_3_SQL: string;
export declare class TypeOrmBackfillGateway implements BackfillGateway {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    analyze(): Promise<void>;
    nextWindowEnd(afterId: string, batchSize: number): Promise<string | null>;
    stampWindow(afterId: string, endId: string, timeouts: BackfillTimeouts): Promise<number>;
}
