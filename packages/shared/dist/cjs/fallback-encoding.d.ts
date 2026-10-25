/**
 * Encode/decode the per-fallback "use this specific provider key" pin.
 *
 * `tier_assignments.fallback_models` stays a plain `string[]` for storage
 * compatibility — older entries without a pin look exactly the same. New
 * entries serialize the optional key label as a `||<label>` suffix:
 *
 *   `gemini-2.5-flash`            → no key pin (use the provider's first key)
 *   `gemini-2.5-flash||Work`      → use the key labeled "Work"
 *
 * `||` was picked because it doesn't appear in any model identifier we ship
 * (Anthropic Bedrock ARNs use a single `:`, OpenRouter ids use `/`, Ollama
 * tags use `:`, etc).
 */
export declare const FALLBACK_KEY_DELIMITER = "||";
export interface FallbackEntry {
    model: string;
    providerKeyLabel?: string;
}
export declare function parseFallbackEntry(entry: string): FallbackEntry;
export declare function encodeFallbackEntry(entry: FallbackEntry): string;
//# sourceMappingURL=fallback-encoding.d.ts.map