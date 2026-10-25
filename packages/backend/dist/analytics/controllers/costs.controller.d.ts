import { AnalyticsScopeService } from '../services/analytics-scope.service';
import { RangeQueryDto } from '../../common/dto/range-query.dto';
import { AggregationService } from '../services/aggregation.service';
import { TimeseriesQueriesService } from '../services/timeseries-queries.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
export declare class CostsController {
    private readonly analyticsScope;
    private readonly aggregation;
    private readonly timeseries;
    constructor(analyticsScope: AnalyticsScopeService, aggregation: AggregationService, timeseries: TimeseriesQueriesService);
    getCosts(query: RangeQueryDto, ctx: TenantContext): Promise<{
        summary: {
            weekly_cost: {
                value: number;
                trend_pct: number;
            };
        };
        daily: {
            date: string;
            cost: number;
        }[] | {
            hour?: string;
            date?: string;
            cost: number;
        }[];
        hourly: {
            date: string;
            cost: number;
        }[] | {
            hour?: string;
            date?: string;
            cost: number;
        }[];
        by_model: {
            model: string;
            display_name: string;
            tokens: number;
            share_pct: number;
            estimated_cost: number;
            auth_type: string | null;
            provider: string | null;
            custom_provider_name: string | null;
        }[];
    }>;
}
