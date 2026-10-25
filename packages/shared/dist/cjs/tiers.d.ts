export declare const TIERS: readonly ["simple", "standard", "complex", "reasoning"];
export type Tier = (typeof TIERS)[number];
export declare const DEFAULT_TIER_SLOT: "default";
export type DefaultTierSlot = typeof DEFAULT_TIER_SLOT;
export declare const TIER_SLOTS: readonly ["simple", "standard", "complex", "reasoning", "default"];
export type TierSlot = (typeof TIER_SLOTS)[number];
export declare const TIER_LABELS: Readonly<Record<TierSlot, string>>;
export declare const TIER_DESCRIPTIONS: Readonly<Record<TierSlot, string>>;
/**
 * Superset of the scoring-output `Tier` that includes non-scoring tier values
 * which can legally appear in `agent_messages.routing_tier`: `'direct'` for
 * explicit SDK model overrides and `'playground'` for `/api/v1/playground/run`.
 * Use this type (not `Tier`)
 * for message badges, filters, and telemetry buckets. Do NOT use it in the
 * scoring, routing, or tier-assignment layers — those consume the narrower
 * `Tier` domain.
 */
export declare const ALL_TIERS: readonly ["simple", "standard", "complex", "reasoning", "direct", "playground"];
export type MessageTier = (typeof ALL_TIERS)[number];
export declare const TIER_LABELS_ALL: Readonly<Record<MessageTier, string>>;
//# sourceMappingURL=tiers.d.ts.map