"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNKNOWN_VERSION = exports.TELEMETRY_DOCS_URL = exports.TELEMETRY_SCHEMA_VERSION = exports.DEFAULT_TELEMETRY_ENDPOINT = void 0;
exports.buildTelemetryConfig = buildTelemetryConfig;
exports.readManifestVersion = readManifestVersion;
const fs_1 = require("fs");
const path_1 = require("path");
exports.DEFAULT_TELEMETRY_ENDPOINT = 'https://telemetry.manifest.build/v1/report';
exports.TELEMETRY_SCHEMA_VERSION = 1;
exports.TELEMETRY_DOCS_URL = 'https://manifest.build/llm-gateway/docs/self-hosted/#telemetry';
function buildTelemetryConfig(env = process.env) {
    const disabled = env['MANIFEST_TELEMETRY_DISABLED'];
    const isProd = (env['NODE_ENV'] ?? 'development') === 'production';
    const isDisabled = disabled === '1' || disabled === 'true';
    const manifestVersion = readManifestVersion();
    const versionReadable = manifestVersion !== exports.UNKNOWN_VERSION;
    return {
        enabled: isProd && !isDisabled && versionReadable,
        endpoint: env['TELEMETRY_ENDPOINT']?.trim() || exports.DEFAULT_TELEMETRY_ENDPOINT,
        manifestVersion,
    };
}
exports.UNKNOWN_VERSION = 'unknown';
function readManifestVersion() {
    try {
        const path = (0, path_1.resolve)(__dirname, '../../../manifest/package.json');
        const raw = (0, fs_1.readFileSync)(path, 'utf8');
        const pkg = JSON.parse(raw);
        if (typeof pkg.version === 'string')
            return pkg.version;
        return exports.UNKNOWN_VERSION;
    }
    catch {
        return exports.UNKNOWN_VERSION;
    }
}
//# sourceMappingURL=telemetry.config.js.map