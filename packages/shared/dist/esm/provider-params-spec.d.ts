import type { AuthType } from './auth-types';
import type { JsonPrimitive, JsonValue } from './request-params';
export declare const MODEL_MODALITIES: readonly ["text", "image", "audio", "video"];
export type ModelModality = (typeof MODEL_MODALITIES)[number];
export declare const MODEL_CAPABILITIES: readonly ["text", "image", "audio", "video", "stream", "tools"];
export type ModelCapability = (typeof MODEL_CAPABILITIES)[number];
export type ModelParamType = 'boolean' | 'enum' | 'integer' | 'number' | 'string';
export type ModelParamGroup = 'generation_length' | 'sampling' | 'reasoning' | 'tooling' | 'output_format' | 'observability' | 'provider_metadata';
export interface ModelParamRange {
    min?: number;
    max?: number;
    step?: number;
}
export interface ParamApplicabilityCondition {
    not: JsonPrimitive | readonly JsonPrimitive[];
}
/**
 * MPS applicability is a deliberately small JSON rule language.
 * Keep this in sync with docs/model-parameters-schema.md.
 */
export type ParamApplicabilityValue = JsonPrimitive | readonly JsonPrimitive[] | ParamApplicabilityCondition;
export type ParamApplicabilityMatch = Record<string, ParamApplicabilityValue>;
export type ParamApplicabilityRule = ParamApplicabilityMatch | readonly ParamApplicabilityMatch[];
export interface ParamApplicability {
    /**
     * Present only when the param is available for the matching values.
     * Omitted `applicability` means always available.
     */
    only?: ParamApplicabilityRule;
    /** Present when the param is unavailable for the matching values. */
    except?: ParamApplicabilityRule;
}
export interface ModelParamDefinition {
    /**
     * Dot path through the storage and request body shape.
     * Examples: `temperature`, `reasoning_effort`, `thinking.budget_tokens`.
     */
    path: string;
    type: ModelParamType;
    label: string;
    description: string;
    default?: JsonValue;
    values?: readonly JsonValue[];
    range?: ModelParamRange;
    group: ModelParamGroup;
    applicability?: ParamApplicability;
}
export interface ProviderModelParamSpec {
    provider: string;
    authType: AuthType;
    model: string;
    capabilities?: readonly ModelCapability[];
    params: readonly ModelParamDefinition[];
}
export interface ProviderParamSpec extends ModelParamDefinition {
    provider: string;
    authType: AuthType;
    model: string;
}
export type ProviderParamSpecCatalog = readonly ProviderModelParamSpec[];
export declare function normalizeProviderParamProviderId(providerId: string): string;
export declare function getProviderParamSpecs(catalog: ProviderParamSpecCatalog, providerId: string | undefined, authType: AuthType | undefined, model: string | undefined): readonly ProviderParamSpec[];
export declare function getProviderModelCapabilities(catalog: ProviderParamSpecCatalog, providerId: string | undefined, authType: AuthType | undefined, model: string | undefined): readonly ModelCapability[] | null;
export declare function compareProviderParamSpecs(a: ModelParamDefinition, b: ModelParamDefinition): number;
export declare function providerParamIsApplicable(spec: ModelParamDefinition, values: Record<string, unknown>): boolean;
export declare function isParamApplicability(value: unknown): value is ParamApplicability;
export declare function isProviderParamPath(path: string): boolean;
export declare function pickProviderCompatibleParams(params: Record<string, unknown>, specs: readonly ProviderParamSpec[]): Record<string, JsonValue>;
export declare function providerParamValueIsValid(spec: ModelParamDefinition, value: unknown): boolean;
export declare function omitProviderInapplicableParams<T extends Record<string, unknown>>(params: T, specs: readonly ProviderParamSpec[]): T;
/**
 * Fill missing sibling defaults when a nested param object is configured.
 * Example: saving `thinking.type=enabled` also needs the applicable
 * `thinking.budget_tokens` default so the provider receives a complete
 * thinking object.
 */
export declare function expandConfiguredParamDefaults(params: Record<string, unknown>, specs: readonly ProviderParamSpec[]): Record<string, unknown>;
export declare function getProviderParamValue(values: Record<string, unknown> | null | undefined, path: string): unknown;
export declare function setProviderParamValue<T extends Record<string, unknown>>(values: T, path: string, value: JsonValue): T;
export declare function deleteProviderParamValue<T extends Record<string, unknown>>(values: T, path: string): T;
//# sourceMappingURL=provider-params-spec.d.ts.map