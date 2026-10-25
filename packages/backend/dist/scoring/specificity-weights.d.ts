import type { SpecificityCategory } from 'manifest-shared';
export declare const KEYWORD_WEIGHTS: Record<string, number>;
export declare const ACTIVATION_THRESHOLDS: Record<SpecificityCategory, number>;
export declare function weightFor(keyword: string): number;
