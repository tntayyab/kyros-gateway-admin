export interface CustomProviderModel {
    model_name: string;
    input_price_per_million_tokens?: number;
    output_price_per_million_tokens?: number;
    context_window?: number;
    price_estimated?: boolean;
}
export type CustomProviderApiKind = 'openai' | 'anthropic';
export declare class CustomProvider {
    id: string;
    tenant_id: string;
    created_by_user_id: string | null;
    name: string;
    alias: string | null;
    base_url: string;
    api_kind: CustomProviderApiKind;
    models: CustomProviderModel[];
    created_at: string;
}
