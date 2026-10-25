export interface PkcePair {
    verifier: string;
    challenge: string;
}
export declare function generatePkce(): PkcePair;
export declare function generateState(byteLength?: number): string;
