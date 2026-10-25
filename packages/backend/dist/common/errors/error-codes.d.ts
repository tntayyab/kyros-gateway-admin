import { MANIFEST_ERRORS_DOCS_BASE } from 'manifest-shared';
export { MANIFEST_ERRORS_DOCS_BASE };
export declare const MANIFEST_ERRORS: {
    readonly M001: {
        readonly title: "Missing Authorization header";
        readonly template: "Missing the Authorization header. Set it to \"Bearer mnfst_<your-key>\".";
    };
    readonly M002: {
        readonly title: "Empty Bearer token";
        readonly template: "The Bearer token is empty. Paste your Manifest key into it.";
    };
    readonly M003: {
        readonly title: "Invalid key format";
        readonly template: "That doesn't look right. Manifest keys start with \"mnfst_\". Grab yours from the dashboard.";
    };
    readonly M004: {
        readonly title: "Key expired";
        readonly template: "This key has expired. Generate a new one here";
    };
    readonly M005: {
        readonly title: "Key not recognized";
        readonly template: "I don't recognize this key. It might have been rotated or deleted. Grab the current one from the dashboard.";
    };
    readonly M100: {
        readonly title: "Provider API key missing";
        readonly template: "No {provider} API key yet. Add one here: {dashboardUrl}";
    };
    readonly M101: {
        readonly title: "No model to route to";
        readonly template: "This harness has no model to route to yet. Pick a default model here: {dashboardUrl}";
    };
    readonly M102: {
        readonly title: "Provider subscription credentials unusable";
        readonly template: "{provider} subscription credentials could not be refreshed. Reconnect OAuth here: {dashboardUrl}";
    };
    readonly M200: {
        readonly title: "Usage limit exceeded";
        readonly template: "You hit your {metric} limit: {used} used, {threshold}/{period} allowed. Adjust it here: {dashboardUrl}";
    };
    readonly M201: {
        readonly title: "Per-user rate limit exceeded";
        readonly template: "Too many requests — wait a few seconds and retry.";
    };
    readonly M202: {
        readonly title: "Per-IP rate limit exceeded";
        readonly template: "Too many requests from this IP — wait a few seconds and retry.";
    };
    readonly M203: {
        readonly title: "Concurrency limit exceeded";
        readonly template: "Too many concurrent requests. Give it a moment.";
    };
    readonly M204: {
        readonly title: "Monthly request limit reached";
        readonly template: string;
    };
    readonly M300: {
        readonly title: "Missing messages array";
        readonly template: "`messages` array is required.";
    };
    readonly M302: {
        readonly title: "Model not available";
        readonly template: "Model \"{model}\" is not available for this agent. Use GET /v1/models to list available model IDs, or make the provider available for this agent here: {dashboardUrl}";
    };
    readonly M303: {
        readonly title: "Local provider unavailable on Manifest Cloud";
        readonly template: "Built-in local providers are only available in self-hosted Manifest. On Manifest Cloud, expose the runtime through a public URL or tunnel and connect it as a custom provider.";
    };
    readonly M500: {
        readonly title: "Internal server error";
        readonly template: "Something broke on our end. Try again in a moment.";
    };
};
export type ManifestErrorCode = keyof typeof MANIFEST_ERRORS;
export declare function formatManifestError(code: ManifestErrorCode, vars?: Record<string, string | number>): string;
export declare function extractManifestErrorCode(text: string | null | undefined): ManifestErrorCode | null;
