export interface QualityScoreInput {
    model_name: string;
    input_price_per_token: number | null;
    output_price_per_token: number | null;
    capability_reasoning: boolean;
    capability_code: boolean;
    context_window: number;
}
export declare const QUALITY_OVERRIDES: ReadonlyMap<string, number>;
export declare function computeQualityScore(model: QualityScoreInput): number;
