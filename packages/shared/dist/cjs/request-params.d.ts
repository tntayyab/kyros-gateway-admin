import { type ProviderParamSpec } from './provider-params-spec';
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | {
    [key: string]: JsonValue;
};
/** Per-route UI/storage values shaped by `ProviderParamSpec.path`. */
export type RequestParamDefaults = Record<string, JsonValue>;
/**
 * Merge configured Manifest params into a request body using the route's
 * param specs. Storage stays as UI values. The provider wire shape is the
 * same path shape unless a future provider needs a dedicated transformer.
 */
export declare function applyRequestParamDefaults<T extends Record<string, unknown>>(body: T, defaults: RequestParamDefaults | null | undefined, specs: readonly ProviderParamSpec[]): T;
//# sourceMappingURL=request-params.d.ts.map