import { CanActivate, ExecutionContext, OnModuleDestroy } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantCacheService } from '../common/services/tenant-cache.service';
export declare class SessionGuard implements CanActivate, OnModuleDestroy {
    private readonly reflector;
    private readonly tenantCache;
    private readonly logger;
    private readonly cache;
    private readonly CACHE_TTL_MS;
    private readonly MAX_CACHE_SIZE;
    private readonly cleanupTimer;
    constructor(reflector: Reflector, tenantCache: TenantCacheService);
    onModuleDestroy(): void;
    canActivate(context: ExecutionContext): Promise<boolean>;
    private attachTenantContext;
    invalidateCache(cookieHeader?: string): void;
    private hashCookie;
    private storeInCache;
    private evictExpired;
}
