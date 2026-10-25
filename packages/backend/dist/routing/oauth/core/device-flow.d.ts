export declare const ABSOLUTE_TIME_THRESHOLD_MS = 10000000000;
export declare function toAbsoluteExpiryTimestamp(expiresIn: number): number;
export declare function toPollIntervalMs(interval: number | undefined, defaultMs: number): number;
