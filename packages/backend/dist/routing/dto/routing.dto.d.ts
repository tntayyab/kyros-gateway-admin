import type { AuthType } from 'manifest-shared';
import { type ResponseMode } from 'manifest-shared';
export declare const MAX_PROVIDER_KEY_LABEL_LENGTH = 50;
export declare class ModelRouteDto {
    provider: string;
    authType: 'api_key' | 'subscription' | 'local';
    model: string;
    keyLabel?: string;
}
export declare class AgentNameParamDto {
    agentName: string;
}
export declare class TierParamDto {
    tier: string;
}
export declare class ProviderParamDto {
    provider: string;
}
export declare class ConnectProviderDto {
    provider: string;
    apiKey?: string;
    authType?: AuthType;
    region?: string;
    baseUrl?: string;
    base_url?: string;
    label?: string;
}
export declare class AgentProviderParamDto {
    agentName: string;
    provider: string;
}
export declare class AgentProviderKeyParamDto {
    agentName: string;
    provider: string;
    label: string;
}
export declare class ProviderKeyParamDto {
    provider: string;
    label: string;
}
export declare class RemoveProviderQueryDto {
    authType?: 'api_key' | 'subscription';
    label?: string;
}
export declare class RenameProviderKeyDto {
    newLabel: string;
    authType?: 'api_key' | 'subscription';
}
export declare class ReorderProviderKeysDto {
    labels: string[];
    authType?: 'api_key' | 'subscription';
}
export declare class SetOverrideDto {
    model: string;
    provider?: string;
    authType?: 'api_key' | 'subscription' | 'local';
    providerKeyLabel?: string;
    route?: ModelRouteDto;
}
export declare class CopilotPollDto {
    deviceCode: string;
}
export declare class SetFallbacksDto {
    models: string[];
    routes?: ModelRouteDto[];
}
export declare class SetResponseModeDto {
    response_mode?: ResponseMode;
    responseMode?: ResponseMode;
}
export declare function responseModeFromDto(body: SetResponseModeDto): ResponseMode | undefined;
export declare class UpdateAutofixDto {
    enabled?: boolean;
}
export declare class UpdateRecordingDto {
    enabled?: boolean;
}
