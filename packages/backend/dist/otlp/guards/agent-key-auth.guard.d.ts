import { CanActivate, ExecutionContext, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AgentApiKey } from '../../entities/agent-api-key.entity';
export declare class AgentKeyAuthGuard implements CanActivate, OnModuleInit, OnModuleDestroy {
    private readonly keyRepo;
    private readonly configService;
    private readonly logger;
    private static cache;
    private devContext;
    private readonly CACHE_TTL_MS;
    private readonly MAX_CACHE_SIZE;
    private static negativeCache;
    private readonly NEGATIVE_CACHE_TTL_MS;
    private readonly MAX_NEGATIVE_CACHE_SIZE;
    private readonly cleanupTimer;
    constructor(keyRepo: Repository<AgentApiKey>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    canActivate(context: ExecutionContext): Promise<boolean>;
    invalidateCache(key: string): void;
    clearCache(): void;
    private setContext;
    private handleDevLoopback;
    private validateMnfstToken;
    private resolveDevContext;
    private rememberInvalid;
    private evictExpired;
}
