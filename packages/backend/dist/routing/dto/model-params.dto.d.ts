import { type AuthType, type JsonValue, type RequestParamDefaults } from 'manifest-shared';
export type ModelParamsBodyDto = RequestParamDefaults;
export declare class SetModelParamsBodyDto {
    scope: string;
    provider: string;
    authType: AuthType;
    model: string;
    params: RequestParamDefaults;
}
export declare class DeleteModelParamsBodyDto {
    scope: string;
    provider: string;
    authType: AuthType;
    model: string;
}
export declare class ModelParamSpecsQueryDto {
    provider: string;
    authType: AuthType;
    model: string;
}
export declare class TierModelParamsPathDto {
    agentName: string;
    tier: string;
}
export declare class TierModelParamsQueryDto {
    model?: string;
}
export declare class UpdateTierModelParamsBodyDto {
    set?: Record<string, JsonValue>;
    unset?: string[];
}
