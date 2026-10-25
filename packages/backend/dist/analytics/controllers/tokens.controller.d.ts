import { AnalyticsScopeService } from '../services/analytics-scope.service';
import { RangeQueryDto } from '../../common/dto/range-query.dto';
import { AggregationService } from '../services/aggregation.service';
import { TimeseriesQueriesService } from '../services/timeseries-queries.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
export declare class TokensController {
    private readonly analyticsScope;
    private readonly aggregation;
    private readonly timeseries;
    constructor(analyticsScope: AnalyticsScopeService, aggregation: AggregationService, timeseries: TimeseriesQueriesService);
    getTokens(query: RangeQueryDto, ctx: TenantContext): Promise<{
        summary: {
            total_tokens: {
                value: number;
                trend_pct: number;
                sub_values: {
                    input: number;
                    output: number;
                };
            };
            input_tokens: number;
            output_tokens: number;
        };
        hourly: {
            date: string;
            input_tokens: number;
            output_tokens: number;
        }[] | {
            hour?: string;
            date?: string;
            input_tokens: number;
            output_tokens: number;
        }[];
        daily: {
            date: string;
            input_tokens: number;
            output_tokens: number;
        }[] | {
            hour?: string;
            date?: string;
            input_tokens: number;
            output_tokens: number;
        }[];
    }>;
}
