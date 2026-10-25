import { Repository } from 'typeorm';
import { TierAssignment } from '../../entities/tier-assignment.entity';
import { RoutingCacheService } from './routing-cache.service';
export declare class RoutingInvalidationService {
    private readonly tierRepo;
    private readonly routingCache;
    private readonly logger;
    constructor(tierRepo: Repository<TierAssignment>, routingCache: RoutingCacheService);
    invalidateOverridesForRemovedModels(removedModels: string[]): Promise<void>;
}
