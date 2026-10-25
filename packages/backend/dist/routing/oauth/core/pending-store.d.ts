export interface PendingEntry {
    expiresAt: number;
}
export declare class PendingStore<T extends PendingEntry> {
    private readonly ttlMs;
    private readonly entries_;
    constructor(ttlMs: number);
    set(key: string, value: Omit<T, 'expiresAt'> & Partial<PendingEntry>): T;
    get(key: string): T | undefined;
    peek(key: string): T | undefined;
    consume(key: string): T | undefined;
    delete(key: string): void;
    size(): number;
    isEmpty(): boolean;
    entries(): IterableIterator<[string, T]>;
    private cleanup;
}
