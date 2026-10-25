import { ScorerInput, ScoringResult, ScorerConfig } from './types';
import { MomentumInput } from './momentum';
export type { ScorerInput, ScoringResult, ScorerConfig, DimensionScore, Tier, ScoringReason, } from './types';
export type { MomentumInput } from './momentum';
export { detectSpecificity } from './specificity-detector';
export type { SpecificityResult } from './specificity-detector';
export { scanMessages } from './scan-messages';
export declare function scoreRequest(input: ScorerInput, configOverride?: Partial<ScorerConfig>, momentum?: MomentumInput): ScoringResult;
export declare function getDefaultConfig(): ScorerConfig;
