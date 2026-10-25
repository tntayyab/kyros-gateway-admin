export declare const AGENT_CATEGORIES: readonly ["personal", "automation", "app", "coding"];
export type AgentCategory = (typeof AGENT_CATEGORIES)[number];
export declare const AGENT_PLATFORMS: readonly ["openclaw", "hermes", "nanobot", "craft", "n8n", "claude-code", "opencode", "codex", "openai-sdk", "anthropic-sdk", "vercel-ai-sdk", "langchain", "curl", "other"];
export type AgentPlatform = (typeof AGENT_PLATFORMS)[number];
/** Coerce persisted or untrusted platform values to the closed public enum. */
export declare function coerceAgentPlatform(value: string | null | undefined): AgentPlatform;
export declare const CATEGORY_LABELS: Readonly<Record<AgentCategory, string>>;
/**
 * Which proxy surface a platform's NATIVE traffic speaks. Single source of
 * truth for anything that impersonates or reasons about platform traffic
 * (CLI `routing test`, Wingman profiles, docs). Adding a platform above
 * without a surface here is a type error — the mapping can never go stale.
 */
export declare const API_SURFACES: readonly ["chat_completions", "messages", "responses"];
export type ApiSurface = (typeof API_SURFACES)[number];
export declare const PLATFORM_API_SURFACES: Readonly<Record<AgentPlatform, ApiSurface>>;
export declare const PLATFORM_LABELS: Readonly<Record<AgentPlatform, string>>;
export declare const PLATFORMS_BY_CATEGORY: Readonly<Record<AgentCategory, readonly AgentPlatform[]>>;
export declare const PLATFORM_ICONS: Readonly<Partial<Record<AgentPlatform, string>>>;
export declare function platformIcon(platform: string | null | undefined, category: string | null | undefined): string | undefined;
//# sourceMappingURL=agent-type.d.ts.map