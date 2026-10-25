import { S3Client } from '@aws-sdk/client-s3';
import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export type RecordingStorageBackend = 'filesystem' | 's3';
export interface RecordingStorage {
    readonly backend: RecordingStorageBackend;
    prepare(): Promise<void>;
    put(key: string, body: Buffer): Promise<void>;
    get(key: string): Promise<Buffer>;
    delete(key: string): Promise<void>;
}
export interface S3StorageConfig {
    bucket: string;
    endpoint?: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    forcePathStyle: boolean;
}
export type ResolvedRecordingStorage = {
    backend: 'filesystem';
    path: string;
} | ({
    backend: 's3';
} & S3StorageConfig) | {
    backend: null;
    reason: string;
};
interface RecordingStorageConfigSource {
    get<T = unknown>(key: string): T | undefined;
}
export declare function resolveRecordingStorage(config: RecordingStorageConfigSource, selfHosted?: boolean, cwd?: string): ResolvedRecordingStorage;
export declare class S3RecordingStorage implements RecordingStorage {
    private readonly config;
    readonly backend: "s3";
    private readonly client;
    constructor(config: S3StorageConfig, client?: S3Client);
    prepare(): Promise<void>;
    put(key: string, body: Buffer): Promise<void>;
    get(key: string): Promise<Buffer>;
    delete(key: string): Promise<void>;
}
export declare class RequestRecordingStorageService implements OnModuleInit {
    private readonly logger;
    private storage;
    private unavailableReason;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    get backend(): RecordingStorageBackend | null;
    objectKey(tenantId: string, requestId: string, attemptId: string): string;
    put(key: string, body: Buffer): Promise<void>;
    get(key: string): Promise<Buffer>;
    delete(key: string): Promise<void>;
    private requireStorage;
}
export {};
