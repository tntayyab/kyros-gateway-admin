import { DataSource } from 'typeorm';
export type BillingEmailLogQueryable = {
    query(sql: string, params?: unknown[]): Promise<unknown>;
};
export interface BillingEmailLogParams {
    dedupeKey: string;
    kind: string;
    tenantId?: string | null;
    userId?: string | null;
    stripeSubscriptionId?: string | null;
    periodStart?: string | null;
    periodEnd?: string | null;
    metadata?: Record<string, unknown> | null;
}
export declare function hasBillingEmailLog(db: BillingEmailLogQueryable, dedupeKey: string): Promise<boolean>;
export declare function tryInsertBillingEmailLog(db: BillingEmailLogQueryable, params: BillingEmailLogParams): Promise<boolean>;
export declare class BillingEmailLogService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    hasDedupeKey(dedupeKey: string): Promise<boolean>;
    tryInsert(params: BillingEmailLogParams): Promise<boolean>;
}
