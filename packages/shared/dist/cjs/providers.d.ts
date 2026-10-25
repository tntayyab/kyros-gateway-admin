/**
 * Canonical provider registry shared between backend and frontend.
 *
 * Every provider the system supports is declared here ONCE. Both the backend
 * (`PROVIDER_REGISTRY`) and the frontend (`PROVIDERS`) consume this list.
 * Backend-only fields (OpenRouter vendor prefixes, key requirement flags) live
 * alongside frontend-only visual bits (color, key prefix) so the two packages
 * can never drift on any shared fact.
 */
export interface SharedProviderEntry {
    /** Internal provider ID (lowercase, no spaces). */
    id: string;
    /** Human-readable display name shown in the UI. */
    displayName: string;
    /** Alternative IDs that map to this provider. */
    aliases: readonly string[];
    /**
     * OpenRouter vendor prefixes that map to this provider.
     * Used to attribute models from OpenRouter's API to their real provider.
     * E.g. "anthropic" prefix in "anthropic/claude-opus-4-6" → Anthropic.
     */
    openRouterPrefixes: readonly string[];
    /** Whether the provider requires an API key for model fetching. */
    requiresApiKey: boolean;
    /** Whether this provider is local-only (e.g. Ollama). */
    localOnly: boolean;
    /** Brand color used in the UI. */
    color: string;
    /** Expected API-key prefix (used for validation / placeholder). */
    keyPrefix: string;
    /** Minimum plausible API-key length. */
    minKeyLength: number;
    /** Placeholder shown in the UI's API-key input. */
    keyPlaceholder: string;
    /** Whether Manifest provisions this provider through its managed free-provider flow. */
    managedFree?: boolean;
    /**
     * Tiles that deep-link users into the local-server detail view (LM
     * Studio today). They do not have a fixed proxy endpoint — once
     * connected, the backend routes through the `custom:<uuid>` path
     * using the user-entered base URL. The proxy endpoint sanity test
     * skips entries with `tileOnly: true`.
     */
    tileOnly?: boolean;
}
export interface MetaModelApiModel {
    id: string;
    displayName: string;
}
export declare const META_MODEL_API_CONTEXT_WINDOW = 1048576;
export declare const META_MODEL_API_MODELS: readonly MetaModelApiModel[];
export declare const META_MODEL_API_MODEL_BY_ID: ReadonlyMap<string, MetaModelApiModel>;
export declare const SHARED_PROVIDERS: readonly SharedProviderEntry[];
/**
 * Canonical IDs of providers that run on the user's own machine.
 * Used by the backend (`getAuthType`) and the frontend (provider modal
 * tabs, filtering) to decide whether a provider should be tagged
 * `auth_type: 'local'` and surfaced under the Local tab.
 */
export declare const CANONICAL_LOCAL_IDS: ReadonlySet<string>;
/** Map from provider ID → shared entry. */
export declare const SHARED_PROVIDER_BY_ID: ReadonlyMap<string, SharedProviderEntry>;
/** Map from any ID or alias → shared entry. */
export declare const SHARED_PROVIDER_BY_ID_OR_ALIAS: ReadonlyMap<string, SharedProviderEntry>;
/**
 * Collapse whitespace, dots, underscores, and hyphens so variants like
 * "LM Studio", "lm-studio", "lm.studio" and "lmstudio" all normalize to
 * the same alias key. Used wherever we match a free-form provider name
 * (custom-provider row names, deep-link params, test fixtures) against
 * `SHARED_PROVIDER_BY_ID_OR_ALIAS`.
 */
export declare const normalizeProviderName: (s: string) => string;
/**
 * Setup hints for local-LLM provider tiles: default port, setup command,
 * install URL, and Docker-specific fix copy. Consumed by the frontend
 * detail view to surface actionable guidance when the server is
 * unreachable.
 */
export interface LocalServerHint {
    /** Default port the server listens on. */
    defaultPort: number;
    /** One-line terminal command that starts the server with the right flags. */
    setupCommand: string;
    /** Optional note displayed below the setup command (e.g. to explain placeholders). */
    setupNote?: string;
    /** Where to send users who don't have the server installed yet (homepage / download page). */
    installUrl: string;
    /**
     * Short human-readable note shown at the top of the detail view when
     * the user is running Manifest inside Docker and the server needs to
     * bind `0.0.0.0` (otherwise host.docker.internal can't reach it).
     */
    dockerBindNote?: string;
    /**
     * One-liner CLI command that explicitly rebinds the server to `0.0.0.0`
     * so it's reachable from a Docker container on the same host. Used in
     * the Docker caveat card when the user's default setupCommand doesn't
     * already include the right bind (LM Studio's default is loopback).
     */
    dockerBindCommand?: string;
    /**
     * Human-readable GUI path to flip the "serve on network" toggle in the
     * provider's desktop app. Shown alongside the CLI command for users
     * who prefer not to open a terminal. Only set for providers that have
     * such a toggle (LM Studio).
     */
    dockerGuiFix?: string;
    /**
     * True when the provider's server-start flags persist across restarts
     * (LM Studio remembers the last `--bind`). Surfaces a "one-time setup"
     * reassurance line so users know they don't have to re-run on every
     * launch.
     */
    persistsBindAcrossLaunches?: boolean;
    /**
     * Optional extra copy shown in the failure state under the setup
     * command, with a clickable link that opens the custom-provider form
     * as an escape hatch. Used by llama.cpp to surface that pre-b3800
     * builds don't expose `/v1/models` so the probe can 404 even when the
     * server is up. Structured as three fields so the renderer doesn't
     * have to parse a magic substring out of a free-form string.
     */
    notReachableHint?: {
        before: string;
        linkLabel: string;
        after: string;
    };
}
export declare const LOCAL_SERVER_HINTS: Readonly<Record<string, LocalServerHint>>;
//# sourceMappingURL=providers.d.ts.map