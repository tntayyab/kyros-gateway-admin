export interface TtlCacheOptions {
    maxSize: number;
    ttlMs: number;
}
export declare class TtlCache<K, V> {
    private readonly store;
    private readonly maxSize;
    private readonly ttlMs;
    constructor(options: TtlCacheOptions);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    delete(key: K): boolean;
    has(key: K): boolean;
    clear(): void;
    get size(): number;
    evictExpired(): void;
}
