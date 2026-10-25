import { ScorerConfig, ScorerInput } from './types';
export declare function hasWordBoundaryMatch(text: string, keyword: string): boolean;
export declare function checkFormalLogicOverride(config: ScorerConfig, lastUserText: string): boolean;
export declare function estimateTotalTokens(messages: ScorerInput['messages']): number;
