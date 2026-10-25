export declare const CUSTOM_PROVIDER_API_KINDS: readonly ["openai", "anthropic"];
export type CustomProviderApiKindDto = (typeof CUSTOM_PROVIDER_API_KINDS)[number];
export declare const CUSTOM_PROVIDER_MODEL_LIMIT = 500;
export declare class CustomProviderModelDto {
    model_name: string;
    input_price_per_million_tokens?: number;
    output_price_per_million_tokens?: number;
    context_window?: number;
    price_estimated?: boolean;
}
export declare class CreateCustomProviderDto {
    name: string;
    alias?: string | null;
    base_url: string;
    api_kind?: CustomProviderApiKindDto;
    apiKey?: string;
    models: CustomProviderModelDto[];
}
export declare class ProbeCustomProviderDto {
    base_url: string;
    provider_name?: string;
    api_kind?: CustomProviderApiKindDto;
    apiKey?: string;
    provider_id?: string;
}
export declare class UpdateCustomProviderDto {
    name?: string;
    alias?: string | null;
    base_url?: string;
    api_kind?: CustomProviderApiKindDto;
    apiKey?: string;
    models?: CustomProviderModelDto[];
}
