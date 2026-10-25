import { VersionCheckService, type VersionInfo } from './version-check.service';
export declare class VersionController {
    private readonly versionCheck;
    constructor(versionCheck: VersionCheckService);
    getVersion(): Promise<VersionInfo>;
}
