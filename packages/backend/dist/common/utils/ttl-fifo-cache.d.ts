export interface TtlFifoCacheOptions {
    maxEntries: number;
    ttlMs: number;
    now?: () => number;
}
export declare class TtlFifoCache<K, V> {
    private readonly entries;
    private readonly maxEntries;
    private readonly ttlMs;
    private readonly now;
    constructor(opts: TtlFifoCacheOptions);
    resolve(key: K, loader: (key: K) => Promise<V>, shouldCache?: (value: V) => boolean): Promise<V>;
    invalidate(key: K): void;
}
