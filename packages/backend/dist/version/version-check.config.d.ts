export declare const RELEASES_PAGE_SIZE = 100;
export declare const RELEASES_URL = "https://api.github.com/repos/mnfst/llm-gateway/releases?per_page=100";
export declare const UPGRADE_DOCS_URL = "https://manifest.build/llm-gateway/docs/self-hosted/#upgrading";
export declare const UPGRADE_COMMAND = "docker compose pull && docker compose up -d";
export interface VersionCheckConfig {
    enabled: boolean;
    currentVersion: string;
}
export declare function buildVersionCheckConfig(env?: NodeJS.ProcessEnv): VersionCheckConfig;
export declare function compareVersions(a: string, b: string): number | null;
export declare function parseReleaseTag(tag: unknown): string | null;
export interface ReleaseSummary {
    latest: string;
    releasesBehind: number | null;
}
export declare function summarizeReleases(body: unknown, current: string): ReleaseSummary | null;
export declare function changelogUrlFor(version: string): string;
export declare function githubReleaseUrlFor(version: string): string;
