import { OnModuleDestroy } from '@nestjs/common';
import { Tier } from '../../scoring/types';
import type { SpecificityCategory } from 'manifest-shared';
export declare const SESSION_MOMENTUM_MAX_SESSIONS = 10000;
export declare const SESSION_MOMENTUM_MAX_KEY_LENGTH = 512;
export declare class SessionMomentumService implements OnModuleDestroy {
    private readonly sessions;
    private readonly cleanupTimer;
    constructor();
    onModuleDestroy(): void;
    getRecentTiers(sessionKey: string): Tier[] | undefined;
    getRecentCategories(sessionKey: string): SpecificityCategory[] | undefined;
    recordTier(sessionKey: string, tier: Tier): void;
    recordCategory(sessionKey: string, category: SpecificityCategory): void;
    private readFresh;
    private getOrCreate;
    private touch;
    private isCacheableKey;
    private evictStale;
}
