export declare const RANGE_VALUES: readonly ["1h", "6h", "24h", "7d", "30d", "90d", "365d"];
export type RangeValue = (typeof RANGE_VALUES)[number];
export declare function rangeToInterval(range: string): string;
export declare function rangeToPreviousInterval(range: string): string;
export declare function isHourlyRange(range: string): boolean;
