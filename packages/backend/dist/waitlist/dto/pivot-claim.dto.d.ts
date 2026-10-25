export declare const PIVOT_CLAIM_SOURCES: readonly ["cloud", "self-hosted"];
export type PivotClaimSource = (typeof PIVOT_CLAIM_SOURCES)[number];
export declare const DEFAULT_PIVOT_CLAIM_SOURCE: PivotClaimSource;
export declare class PivotClaimDto {
    email: string;
    source?: PivotClaimSource;
}
