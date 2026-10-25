"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPGRADE_COMMAND = exports.UPGRADE_DOCS_URL = exports.RELEASES_URL = exports.RELEASES_PAGE_SIZE = void 0;
exports.buildVersionCheckConfig = buildVersionCheckConfig;
exports.compareVersions = compareVersions;
exports.parseReleaseTag = parseReleaseTag;
exports.summarizeReleases = summarizeReleases;
exports.changelogUrlFor = changelogUrlFor;
exports.githubReleaseUrlFor = githubReleaseUrlFor;
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
const telemetry_config_1 = require("../telemetry/telemetry.config");
exports.RELEASES_PAGE_SIZE = 100;
exports.RELEASES_URL = `https://api.github.com/repos/mnfst/llm-gateway/releases?per_page=${exports.RELEASES_PAGE_SIZE}`;
exports.UPGRADE_DOCS_URL = 'https://manifest.build/llm-gateway/docs/self-hosted/#upgrading';
exports.UPGRADE_COMMAND = 'docker compose pull && docker compose up -d';
function buildVersionCheckConfig(env = process.env) {
    const disabled = env['MANIFEST_UPDATE_CHECK_DISABLED'];
    const isDisabled = disabled === '1' || disabled === 'true';
    const currentVersion = (0, telemetry_config_1.readManifestVersion)();
    return {
        enabled: (0, detect_self_hosted_1.isSelfHosted)() && !isDisabled && currentVersion !== telemetry_config_1.UNKNOWN_VERSION,
        currentVersion,
    };
}
const STRICT_SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const RELEASE_TAG = /^manifest@(\d+\.\d+\.\d+)$/;
function compareVersions(a, b) {
    const pa = STRICT_SEMVER.exec(a);
    const pb = STRICT_SEMVER.exec(b);
    if (!pa || !pb)
        return null;
    for (let i = 1; i <= 3; i++) {
        const diff = Number(pa[i]) - Number(pb[i]);
        if (diff !== 0)
            return diff;
    }
    return 0;
}
function parseReleaseTag(tag) {
    if (typeof tag !== 'string')
        return null;
    const match = RELEASE_TAG.exec(tag);
    return match ? match[1] : null;
}
function summarizeReleases(body, current) {
    if (!Array.isArray(body))
        return null;
    const versions = [];
    for (const entry of body) {
        if (typeof entry !== 'object' || entry === null)
            continue;
        const release = entry;
        if (release.draft === true || release.prerelease === true)
            continue;
        const version = parseReleaseTag(release.tag_name);
        if (version)
            versions.push(version);
    }
    if (versions.length === 0)
        return null;
    let latest = versions[0];
    let releasesBehind = STRICT_SEMVER.test(current) ? 0 : null;
    for (const version of versions) {
        if ((compareVersions(version, latest) ?? 0) > 0)
            latest = version;
        if (releasesBehind !== null && (compareVersions(version, current) ?? 0) > 0)
            releasesBehind++;
    }
    return { latest, releasesBehind };
}
function changelogUrlFor(version) {
    return `https://manifest.build/changelog/#v${version.replace(/\./g, '-')}`;
}
function githubReleaseUrlFor(version) {
    return `https://github.com/mnfst/llm-gateway/releases/tag/${encodeURIComponent(`manifest@${version}`)}`;
}
//# sourceMappingURL=version-check.config.js.map