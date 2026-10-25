import { ScorerMessage, ScorerTool } from './types';
import { SpecificityResult } from './specificity-detector';
import type { SpecificityCategory } from 'manifest-shared';
export declare function scanMessages(messages: ScorerMessage[], tools?: ScorerTool[], headerOverride?: string, recentCategories?: readonly SpecificityCategory[], categoryPenalties?: ReadonlyMap<SpecificityCategory, number>): SpecificityResult | null;
