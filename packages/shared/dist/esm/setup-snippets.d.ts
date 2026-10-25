/**
 * Per-platform setup snippets — the single source of truth for "how do I
 * point this platform at Manifest". Consumed by the dashboard setup panels
 * directly and by the CLI via build-time template generation (functions are
 * invoked with {{ORIGIN}} placeholders and emitted as data).
 */
export declare function getOpenClawSnippet(baseUrl: string, apiKey: string): string;
/**
 * The JSON block to paste into ~/.claude/settings.json. Claude Code reads
 * `env` keys from settings.json on every startup, so this is the persistent
 * configuration path — no shell rc edits, no Node required, no command-line
 * gymnastics. Pin the default model to Manifest's `auto` route so Claude
 * Code does not send its built-in Anthropic model IDs to the gateway.
 * Anthropic SDK auto-appends /v1/messages to baseURL, so we strip a trailing
 * /v1 from the rendered URL.
 */
export declare function getClaudeCodeSettingsSnippet(baseUrl: string, apiKey: string): string;
/**
 * The JSON block to merge into ~/.nanobot/config.json. Nanobot only accepts its
 * predefined provider keys; "custom" is the built-in slot for arbitrary
 * OpenAI-compatible endpoints, so we use that rather than an arbitrary name.
 */
export declare function getNanobotConfigSnippet(baseUrl: string, apiKey: string): string;
/** The `~/.codex/config.toml` block. Codex CLI and Desktop both read this file. */
export declare function getCodexConfigSnippet(baseUrl: string): string;
export declare function getCodexKeyExportSnippet(apiKey: string): string;
/** Which platforms have a first-class setup snippet, and which function renders it. */
export declare const PLATFORM_SETUP_SNIPPETS: Readonly<Record<string, (baseUrl: string, apiKey: string) => string>>;
//# sourceMappingURL=setup-snippets.d.ts.map