import { DataSource } from 'typeorm';
export declare function resolveRequestBackfillDatabaseUrl(env: NodeJS.ProcessEnv): string;
export declare function createRequestBackfillDataSource(env: NodeJS.ProcessEnv): DataSource;
