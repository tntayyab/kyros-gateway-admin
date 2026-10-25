import { OnModuleDestroy } from '@nestjs/common';
export declare class ProxyRateLimiter implements OnModuleDestroy {
    private readonly rates;
    private readonly ipRates;
    private readonly concurrency;
    private readonly concurrencyMax;
    private readonly rateMaxRequests;
    private readonly ipRateMaxRequests;
    private readonly cleanupTimer;
    constructor();
    onModuleDestroy(): void;
    checkLimit(tenantId: string): void;
    checkIpLimit(ip: string): void;
    acquireSlot(tenantId: string): void;
    releaseSlot(tenantId: string): void;
    private evictExpired;
    private evictLruIfNeeded;
    private evictIpLruIfNeeded;
}
