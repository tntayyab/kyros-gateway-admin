import type { ModelRoute, ResponseMode, OutputModality } from 'manifest-shared';
export declare class TierAssignment {
    id: string;
    agent_id: string;
    tier: string;
    override_route: ModelRoute | null;
    auto_assigned_route: ModelRoute | null;
    fallback_routes: ModelRoute[] | null;
    output_modality: OutputModality;
    response_mode: ResponseMode;
    updated_at: string;
}
