import { Logger } from '@nestjs/common';
export interface RefreshableBlob {
    t: string;
    e: number;
}
export declare const REJECTED_TOKEN_EXPIRY = 0;
export declare const REFRESH_EXPIRY_SKEW_MS = 60000;
export declare const PERSIST_MAX_ATTEMPTS = 3;
export interface CredentialLockOps<T extends RefreshableBlob> {
    readFreshRaw: () => Promise<string | null>;
    persist: (refreshed: T) => Promise<void>;
}
export interface CoordinatedRefreshParams<T extends RefreshableBlob> {
    readonly key: string;
    readonly logger: Logger;
    readonly callerBlob: T;
    readonly parse: (raw: string) => T | null;
    readonly refresh: (current: T) => Promise<T>;
    readonly withLock: <R>(fn: (ops: CredentialLockOps<T>) => Promise<R>) => Promise<R>;
}
export declare function oauthRefreshKey(providerId: string, tenantId: string, label?: string): string;
export declare function subscriptionCredentialLock<T extends RefreshableBlob>(lock: <R>(tenantId: string, provider: string, label: string | undefined, fn: (ops: {
    readFreshRaw: () => Promise<string | null>;
    writeRaw: (raw: string) => Promise<void>;
}) => Promise<R>) => Promise<R>, tenantId: string, provider: string, label: string | undefined, serialize: (blob: T) => string): CoordinatedRefreshParams<T>['withLock'];
export declare function coordinateOAuthRefresh<T extends RefreshableBlob>(params: CoordinatedRefreshParams<T>): Promise<T>;
export declare function __resetOAuthRefreshCoordinator(): void;
