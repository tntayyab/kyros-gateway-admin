import { DataSource } from 'typeorm';
export declare const MIGRATION_ADVISORY_LOCK_KEY = 4011985;
export declare const MIGRATION_LOCK_POLL_MS = 2000;
export declare function runMigrationsWithAdvisoryLock(dataSource: DataSource, pollMs?: number): Promise<void>;
