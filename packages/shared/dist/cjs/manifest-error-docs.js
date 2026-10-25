"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANIFEST_ERRORS_DOCS_BASE = void 0;
exports.manifestErrorDocsUrl = manifestErrorDocsUrl;
/**
 * Public documentation for Manifest's own error codes (`M001`, `M100`, …).
 *
 * The code catalogue itself lives backend-side in
 * `packages/backend/src/common/errors/error-codes.ts` — only the docs base URL
 * is shared, because the dashboard renders a "read the docs" link from the
 * `error_code` persisted on a message row and must not re-declare the URL.
 */
exports.MANIFEST_ERRORS_DOCS_BASE = 'https://manifest.build/llm-gateway/docs/errors';
/** Deep link to the documentation page for one Manifest error code. */
function manifestErrorDocsUrl(code) {
    return `${exports.MANIFEST_ERRORS_DOCS_BASE}/${code}/`;
}
//# sourceMappingURL=manifest-error-docs.js.map