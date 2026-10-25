import { AnalyticsScopeService } from '../services/analytics-scope.service';
import { RangeQueryDto } from '../../common/dto/range-query.dto';
import { ErrorBreakdownService } from '../services/error-breakdown.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
export declare class ErrorsController {
    private readonly analyticsScope;
    private readonly errorBreakdown;
    constructor(analyticsScope: AnalyticsScopeService, errorBreakdown: ErrorBreakdownService);
    getBreakdown(query: RangeQueryDto, ctx: TenantContext): Promise<import("../services/error-breakdown.service").ErrorBreakdownResponse>;
}
