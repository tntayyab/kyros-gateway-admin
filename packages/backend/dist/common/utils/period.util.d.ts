export interface PeriodBoundaries {
    periodStart: string;
    periodEnd: string;
}
export declare function computePeriodBoundaries(period: string): PeriodBoundaries;
export declare function computePeriodResetDate(period: string): string;
