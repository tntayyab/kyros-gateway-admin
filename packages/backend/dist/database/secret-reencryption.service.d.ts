import { OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare const REENCRYPTION_ADVISORY_LOCK_KEY = 4011987;
export declare const BATCH_SIZE = 500;
interface EncryptedColumn {
    table: string;
    idColumn: string;
    column: string;
}
export declare const ENCRYPTED_COLUMNS: ReadonlyArray<EncryptedColumn>;
export declare class SecretReencryptionService implements OnApplicationBootstrap {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onApplicationBootstrap(): void;
    run(): Promise<void>;
    private reencryptTable;
}
export {};
