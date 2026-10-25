import { TrieMatch } from '../keyword-trie';
import { ExtractedText } from '../text-extractor';
import { DimensionConfig } from '../types';
export declare function scoreKeywordDimension(dimensionName: string, allMatches: TrieMatch[], extractedTexts: ExtractedText[], direction: DimensionConfig['direction']): {
    rawScore: number;
    matchedKeywords: string[];
};
