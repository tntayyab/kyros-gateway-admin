import { ModelRouteDto } from './routing.dto';
export declare class SetSpecificityOverrideDto {
    model: string;
    provider?: string;
    authType?: 'api_key' | 'subscription' | 'local';
    providerKeyLabel?: string;
    route?: ModelRouteDto;
}
export declare class ToggleSpecificityDto {
    active: boolean;
}
