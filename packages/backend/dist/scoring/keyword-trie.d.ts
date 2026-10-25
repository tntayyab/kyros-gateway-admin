export interface TrieMatch {
    keyword: string;
    dimension: string;
    position: number;
}
export declare function isWordCharCode(code: number): boolean;
export declare class KeywordTrie {
    private root;
    private keywordCount;
    constructor(dimensions: Array<{
        name: string;
        keywords: string[];
    }>);
    private insert;
    private static readonly MAX_SCAN_LENGTH;
    scan(text: string): TrieMatch[];
    get size(): number;
}
