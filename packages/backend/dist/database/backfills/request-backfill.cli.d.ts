import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createRequestBackfillDataSource, resolveRequestBackfillDatabaseUrl } from './request-backfill.datasource';
export { createRequestBackfillDataSource, resolveRequestBackfillDatabaseUrl };
interface BackfillCoordinator {
    runUntilComplete(): Promise<void>;
    runTailOnce(): Promise<boolean>;
    hasUnlinkedAttempts(): Promise<boolean>;
    runTransitionFinalizeOnce(): Promise<boolean>;
}
export interface MainDeps {
    env?: NodeJS.ProcessEnv;
    logger?: {
        log: (message: string) => void;
        error: (message: unknown) => void;
    };
    dataSource?: DataSource;
    coordinator?: BackfillCoordinator;
    sleep?: (ms: number) => Promise<void>;
    initialOnly?: boolean;
}
export declare function main(deps?: MainDeps): Promise<void>;
