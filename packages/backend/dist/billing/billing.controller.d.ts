import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { PlanService } from './plan.service';
import { UpdateBillingEmailPreferencesDto } from './dto/update-billing-email-preferences.dto';
export declare class BillingController {
    private readonly planService;
    constructor(planService: PlanService);
    status(ctx: TenantContext): Promise<import("manifest-shared").BillingStatus>;
    plan(ctx: TenantContext): Promise<import("manifest-shared").BillingPlanStatus>;
    updateEmailPreferences(ctx: TenantContext, body: UpdateBillingEmailPreferencesDto): Promise<import("manifest-shared").BillingEmailPreferences>;
}
