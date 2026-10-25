import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import { UserCacheInterceptor } from './user-cache.interceptor';
import { AgentListCacheService } from '../services/agent-list-cache.service';
export declare class AgentListCacheInterceptor extends UserCacheInterceptor {
    private readonly keys;
    constructor(agentListCache: Cache, reflector: Reflector, keys: AgentListCacheService);
    protected trackBy(context: ExecutionContext): string | undefined;
}
