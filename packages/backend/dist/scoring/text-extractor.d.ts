import { ScorerMessage } from './types';
export interface ExtractedText {
    text: string;
    positionWeight: number;
    messageIndex: number;
}
export declare function extractUserTexts(messages: ScorerMessage[]): ExtractedText[];
export declare function countConversationMessages(messages: ScorerMessage[]): number;
export declare function combinedText(extracted: ExtractedText[]): string;
