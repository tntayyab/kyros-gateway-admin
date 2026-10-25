"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VersionCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionCheckService = exports.VERSION_CHECK_CONFIG = void 0;
const common_1 = require("@nestjs/common");
const version_check_config_1 = require("./version-check.config");
exports.VERSION_CHECK_CONFIG = Symbol('VERSION_CHECK_CONFIG');
const SUCCESS_TTL_MS = 24 * 60 * 60 * 1000;
const FAILURE_BACKOFF_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;
let VersionCheckService = VersionCheckService_1 = class VersionCheckService {
    config;
    logger = new common_1.Logger(VersionCheckService_1.name);
    cached = null;
    lastFailureAt = null;
    inflight = null;
    constructor(config) {
        this.config = config;
    }
    async getVersionInfo() {
        if (this.config.enabled) {
            await this.refreshIfDue();
        }
        return this.buildInfo();
    }
    refreshIfDue() {
        const now = Date.now();
        if (this.cached && now - this.cached.checkedAt < SUCCESS_TTL_MS)
            return Promise.resolve();
        if (this.lastFailureAt !== null && now - this.lastFailureAt < FAILURE_BACKOFF_MS) {
            return Promise.resolve();
        }
        if (!this.inflight) {
            this.inflight = this.refresh(now).finally(() => {
                this.inflight = null;
            });
        }
        return this.inflight;
    }
    async refresh(now) {
        try {
            const summary = await this.fetchReleases();
            this.cached = { ...summary, checkedAt: now };
            this.lastFailureAt = null;
        }
        catch (err) {
            if (this.lastFailureAt === null) {
                const message = err instanceof Error ? err.message : String(err);
                this.logger.warn(`Update check failed (${message}); will retry in an hour`);
            }
            this.lastFailureAt = now;
        }
    }
    async fetchReleases() {
        const res = await fetch(version_check_config_1.RELEASES_URL, {
            headers: { Accept: 'application/vnd.github+json' },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!res.ok) {
            throw new Error(`GitHub responded ${res.status}`);
        }
        const summary = (0, version_check_config_1.summarizeReleases)(await res.json(), this.config.currentVersion);
        if (!summary) {
            throw new Error('no Manifest release in the GitHub response');
        }
        return summary;
    }
    buildInfo() {
        const current = this.config.currentVersion;
        const cached = this.config.enabled ? this.cached : null;
        const latest = cached?.latest ?? null;
        const cmp = latest ? (0, version_check_config_1.compareVersions)(current, latest) : null;
        return {
            current,
            latest,
            update_available: cmp !== null && cmp < 0,
            releases_behind: cached?.releasesBehind ?? null,
            release_url: latest ? (0, version_check_config_1.changelogUrlFor)(latest) : null,
            github_release_url: latest ? (0, version_check_config_1.githubReleaseUrlFor)(latest) : null,
            upgrade_docs_url: version_check_config_1.UPGRADE_DOCS_URL,
            upgrade_command: version_check_config_1.UPGRADE_COMMAND,
            check_enabled: this.config.enabled,
            checked_at: cached ? new Date(cached.checkedAt).toISOString() : null,
        };
    }
};
exports.VersionCheckService = VersionCheckService;
exports.VersionCheckService = VersionCheckService = VersionCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(exports.VERSION_CHECK_CONFIG)),
    __metadata("design:paramtypes", [Object])
], VersionCheckService);
//# sourceMappingURL=version-check.service.js.map