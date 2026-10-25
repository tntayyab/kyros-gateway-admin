interface KnownPrice {
    input: number;
    output: number;
}
export declare function lookupKnownPrice(modelId: string): KnownPrice | null;
export {};
