import { CacheInterceptor } from '@nestjs/cache-manager';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare class UserCacheInterceptor extends CacheInterceptor {
    private readonly inFlightResponses;
    constructor(cacheManager: unknown, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>>;
    protected resolveTenantId(context: ExecutionContext): string | undefined;
    protected trackBy(context: ExecutionContext): string | undefined;
}
