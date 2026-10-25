import { TrieMatch } from './keyword-trie';
import { ScorerTool } from './types';
import { SpecificityCategory } from 'manifest-shared';
export interface SpecificityResult {
    category: SpecificityCategory;
    confidence: number;
}
export declare function detectSpecificity(allMatches: TrieMatch[], tools?: ScorerTool[], headerOverride?: string, thresholdOverride?: number, text?: string, recentCategories?: readonly SpecificityCategory[], categoryPenalties?: ReadonlyMap<SpecificityCategory, number>): SpecificityResult | null;
