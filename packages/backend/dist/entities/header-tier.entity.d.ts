import type { ModelRoute, ResponseMode, OutputModality, TierColor } from 'manifest-shared';
export declare class HeaderTier {
    id: string;
    tenant_id: string;
    agent_id: string;
    name: string;
    header_key: string;
    header_value: string;
    badge_color: TierColor;
    sort_order: number;
    enabled: boolean;
    override_route: ModelRoute | null;
    fallback_routes: ModelRoute[] | null;
    output_modality: OutputModality;
    response_mode: ResponseMode;
    created_at: string;
    updated_at: string;
}
