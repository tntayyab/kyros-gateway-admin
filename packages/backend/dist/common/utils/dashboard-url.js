"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DASHBOARD_URL = void 0;
exports.getDashboardBaseUrl = getDashboardBaseUrl;
exports.getEmailAssetUrl = getEmailAssetUrl;
exports.DEFAULT_DASHBOARD_URL = 'https://app.manifest.build';
function getDashboardBaseUrl(explicit) {
    const explicitBase = explicit?.trim().replace(/\/+$/, '');
    const configuredBase = process.env['BETTER_AUTH_URL']?.trim().replace(/\/+$/, '');
    return explicitBase || configuredBase || exports.DEFAULT_DASHBOARD_URL;
}
function getEmailAssetUrl(path, appUrl) {
    return `${getDashboardBaseUrl(appUrl)}/${path.replace(/^\/+/, '')}`;
}
//# sourceMappingURL=dashboard-url.js.map