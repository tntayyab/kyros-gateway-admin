import type { SpecificityCategory } from 'manifest-shared';
import { ScorerTool } from './types';
export interface SignalBoosts {
    boosts: Map<SpecificityCategory, number>;
}
export declare function computeSignalBoosts(text: string, tools?: ScorerTool[]): SignalBoosts;
