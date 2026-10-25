import { AnalyticsScopeService } from '../services/analytics-scope.service';
import type { Cache } from 'cache-manager';
import { RangeQueryDto } from '../../common/dto/range-query.dto';
import { AutofixStatsService } from '../services/autofix-stats.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
declare class AutofixTimeseriesQueryDto extends RangeQueryDto {
    by?: string;
    failed_only?: string;
}
export declare class AutofixAnalyticsController {
    private readonly analyticsScope;
    private readonly autofixStats;
    private readonly cacheManager;
    constructor(analyticsScope: AnalyticsScopeService, autofixStats: AutofixStatsService, cacheManager: Cache);
    getStatus(ctx: TenantContext): Promise<import("../services/autofix-stats.service").AutofixStatusResponse>;
    enableAll(ctx: TenantContext): Promise<import("../services/autofix-stats.service").AutofixStatusResponse>;
    getStats(query: RangeQueryDto, ctx: TenantContext): Promise<import("../services/autofix-stats.service").AutofixStatsResponse>;
    getTimeseries(query: AutofixTimeseriesQueryDto, ctx: TenantContext): Promise<import("../services/autofix-stats.service").AutofixTimeseriesResponse>;
    getPerAgent(query: RangeQueryDto, ctx: TenantContext): Promise<{
        agent_name: string;
        requests: number;
        failed: number;
        autofixed: number;
        fallback_saves: number;
        succeeded: number;
    }[]>;
    getPerProvider(query: RangeQueryDto, ctx: TenantContext): Promise<{
        provider: string;
        auth_type: string;
        key_label: string;
        attempts: number;
        failed: number;
        succeeded: number;
    }[]>;
    getPerModel(query: RangeQueryDto, ctx: TenantContext): Promise<{
        model: string;
        attempts: number;
        failed: number;
        succeeded: number;
    }[]>;
}
export {};
