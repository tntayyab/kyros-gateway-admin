import { type VersionCheckConfig } from './version-check.config';
export declare const VERSION_CHECK_CONFIG: unique symbol;
export interface VersionInfo {
    current: string;
    latest: string | null;
    update_available: boolean;
    releases_behind: number | null;
    release_url: string | null;
    github_release_url: string | null;
    upgrade_docs_url: string;
    upgrade_command: string;
    check_enabled: boolean;
    checked_at: string | null;
}
export declare class VersionCheckService {
    private readonly config;
    private readonly logger;
    private cached;
    private lastFailureAt;
    private inflight;
    constructor(config: VersionCheckConfig);
    getVersionInfo(): Promise<VersionInfo>;
    private refreshIfDue;
    private refresh;
    private fetchReleases;
    private buildInfo;
}
