"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteOgTags = rewriteOgTags;
const dashboard_url_1 = require("./dashboard-url");
const DEFAULT_BASE = dashboard_url_1.DEFAULT_DASHBOARD_URL;
function rewriteOgTags(html, baseUrl) {
    const trimmed = baseUrl.trim().replace(/\/+$/, '');
    if (!trimmed || trimmed === DEFAULT_BASE)
        return html;
    return html.split(DEFAULT_BASE).join(trimmed);
}
//# sourceMappingURL=og-rewrite.js.map