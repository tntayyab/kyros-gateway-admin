import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { ProviderUsageService, ProviderUsageSummary } from '../services/provider-usage.service';
export declare class ProviderUsageController {
    private readonly providerUsage;
    constructor(providerUsage: ProviderUsageService);
    getUsage(ctx: TenantContext): Promise<{
        providers: ProviderUsageSummary[];
    }>;
}
