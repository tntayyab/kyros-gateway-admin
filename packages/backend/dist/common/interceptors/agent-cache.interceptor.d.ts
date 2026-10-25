import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class AgentCacheInterceptor extends CacheInterceptor {
    constructor(cacheManager: unknown, reflector: Reflector);
    protected trackBy(context: ExecutionContext): string | undefined;
}
