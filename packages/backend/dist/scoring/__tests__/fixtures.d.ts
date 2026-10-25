import { ScorerMessage, Tier } from '../types';
export interface Fixture {
    name: string;
    messages: ScorerMessage[];
    expectedTier: Tier;
    keySignals: string[];
}
export declare const FIXTURES: Fixture[];
