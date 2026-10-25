import { ScoringReason } from '../../scoring';
import type { ModelRoute, ResponseMode, OutputModality, SpecificityCategory, TierSlot } from 'manifest-shared';
export type { AuthType } from 'manifest-shared';
export interface ResolveResponse {
    tier: TierSlot;
    confidence: number;
    score: number;
    reason: ScoringReason;
    route: ModelRoute | null;
    fallback_routes: ModelRoute[] | null;
    output_modality?: OutputModality;
    response_mode?: ResponseMode;
    specificity_category?: SpecificityCategory;
    header_tier_id?: string;
    header_tier_name?: string;
    header_tier_color?: string;
    override_model_unavailable?: string;
}
