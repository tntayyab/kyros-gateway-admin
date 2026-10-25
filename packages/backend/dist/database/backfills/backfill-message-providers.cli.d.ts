import 'dotenv/config';
import { DataSource } from 'typeorm';
import { BackfillOptions, BackfillResult } from './backfill-message-providers';
export declare function readBackfillOptions(env: NodeJS.ProcessEnv): BackfillOptions;
export declare function createBackfillDataSource(env: NodeJS.ProcessEnv): DataSource;
export interface MainDeps {
    env?: NodeJS.ProcessEnv;
    logger?: {
        log: (message: string) => void;
        error: (message: unknown) => void;
    };
    dataSource?: DataSource;
}
export declare function main(deps?: MainDeps): Promise<BackfillResult>;
