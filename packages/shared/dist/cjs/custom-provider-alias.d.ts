/**
 * A custom provider's alias is the first path segment of the model ids
 * `/v1/models` publishes for it (`<alias>/<model_name>`), so it must be a
 * valid segment: lowercase letters, digits, dots and hyphens, with no
 * leading, trailing or doubled separators.
 */
export declare const CUSTOM_PROVIDER_ALIAS_MAX_LENGTH = 50;
export declare const CUSTOM_PROVIDER_ALIAS_PATTERN: RegExp;
export declare const CUSTOM_PROVIDER_ALIAS_MESSAGE = "Alias can only contain lowercase letters, numbers, dots and hyphens, and cannot start or end with a separator";
/** Trim and lowercase user input; an empty value means "no alias". */
export declare function normalizeCustomProviderAlias(input: string | null | undefined): string | null;
export declare function isReservedCustomProviderAlias(alias: string): boolean;
/**
 * Derive the default alias from a display name: `Vercel AI Gateway` →
 * `vercel-ai-gateway`, `llama.cpp` → `llama.cpp`. Returns null when the
 * name yields nothing usable or a reserved alias, in which case the
 * provider keeps publishing under its internal `custom:<uuid>/…` id.
 */
export declare function deriveCustomProviderAlias(name: string): string | null;
//# sourceMappingURL=custom-provider-alias.d.ts.map