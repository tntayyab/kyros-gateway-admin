/**
 * Infer a provider ID from a model name string.
 * This is the unified superset of all regex patterns from backend and frontend.
 */
declare const MODEL_PREFIX_MAP: [RegExp, string][];
export { MODEL_PREFIX_MAP };
export declare function resolveProviderToken(token: string): string | undefined;
/**
 * If `model` is a gateway model id, return the underlying provider's model
 * id; otherwise return `null`. Used to resolve gateway models to the
 * provenance provider whose parameters and capabilities they inherit.
 */
export declare function underlyingGatewayModel(model: string): string | null;
export declare function inferProviderFromModel(model: string): string | undefined;
/**
 * Resolve a `(provider, model)` pair to the underlying provider and model that
 * own its metadata, transparently unwrapping gateway transports. For a gateway
 * model id (e.g. `opencode-go/glm-5.1`) this returns the provenance provider
 * inferred from the underlying id and that bare id
 * (`{ provider: 'zai', model: 'glm-5.1' }`); non-gateway pairs are returned
 * unchanged. The provider is `undefined` when the underlying id matches no
 * known provider, so callers decide whether to fall back. Capability and
 * parameter lookups route through this so any gateway model inherits the
 * underlying model's metadata, not just OpenCode Go's.
 */
export declare function resolveUnderlyingModelIdentity(provider: string | undefined, model: string): {
    provider: string | undefined;
    model: string;
};
/**
 * Resolve the provider/model identity that owns model metadata. This must not
 * be used for inference routing: Bedrock still needs the original model id,
 * but pricing/params/capabilities belong to the underlying model vendor.
 */
export declare function resolveProviderMetadataIdentity(provider: string | undefined, model: string): {
    provider: string | undefined;
    model: string;
};
//# sourceMappingURL=provider-inference.d.ts.map