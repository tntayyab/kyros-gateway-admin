import { Tier, TierBoundaries } from './types';
export declare function scoreToTier(score: number, boundaries: TierBoundaries): Tier;
export declare function computeConfidence(score: number, boundaries: TierBoundaries, k?: number): number;
