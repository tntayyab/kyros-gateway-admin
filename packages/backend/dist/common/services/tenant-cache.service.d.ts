import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
export declare class TenantCacheService {
    private readonly tenantRepo;
    private readonly cache;
    constructor(tenantRepo: Repository<Tenant>);
    resolve(userId: string): Promise<string | null>;
    ensureForUser(userId: string): Promise<string>;
    invalidate(userId: string): void;
}
