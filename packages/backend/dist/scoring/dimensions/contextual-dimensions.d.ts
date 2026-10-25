import { ScorerTool } from '../types';
export declare function scoreExpectedOutputLength(text: string, maxTokens?: number): number;
export declare function scoreRepetitionRequests(text: string): number;
export declare function scoreToolCount(tools?: ScorerTool[], toolChoice?: unknown): number;
export declare function scoreConversationDepth(messageCount: number): number;
