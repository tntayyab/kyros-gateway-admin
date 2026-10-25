import { AnalyticsScopeService } from '../services/analytics-scope.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { RangeQueryDto } from '../../common/dto/range-query.dto';
import { AttemptStatsService } from '../services/attempt-stats.service';
export declare class AttemptAnalyticsController {
    private readonly analyticsScope;
    private readonly attemptStats;
    constructor(analyticsScope: AnalyticsScopeService, attemptStats: AttemptStatsService);
    getStats(query: RangeQueryDto, ctx: TenantContext): Promise<import("../services/attempt-stats.service").AttemptStatsResponse>;
    getTimeseries(query: RangeQueryDto, ctx: TenantContext): Promise<import("../services/attempt-stats.service").AttemptTimeseriesResponse>;
}
